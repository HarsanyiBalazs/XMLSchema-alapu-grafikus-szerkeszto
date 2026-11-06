import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FilledFormsService } from '../../services/filled-forms';
import { ProjectsService } from '../../services/projects';
import { ActivatedRoute } from '@angular/router';
import { FormGenerator } from '../../services/form-generator';
import {FormGroup, FormControl, FormArray, Validators, AbstractControl, ReactiveFormsModule} from '@angular/forms';
import { FormSchema, FormControlSchema, FormGroupSchema, FormArraySchema } from '../../models/formSchema.model';
import { Project } from '../../models/projects.model';
import {XMLParser} from "fast-xml-parser";
import { CommonModule,KeyValue  } from '@angular/common';
import {FilledForms} from '../../models/filledForms.model';

@Component({
  selector: 'app-fillxmlform',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './fillxmlform.html',
  styleUrl: './fillxmlform.css',
})
export class Fillxmlform implements OnInit{
  private filledFormsService = inject(FilledFormsService);
  private projectService = inject(ProjectsService);
  private activatedRouter = inject(ActivatedRoute);
  private formGenerator = inject(FormGenerator);
  private cdr = inject(ChangeDetectorRef);
  showValidationErrors: boolean = false;
  isSubmitted: boolean = false;
  isSubmitting: boolean = false;

  projectId = "";
  activeProject !: Project;
  schema!: FormSchema;
  form!: FormGroup;
  xmlOutput = '';
  filledForms : FilledForms = new FilledForms();
  radioGroupNames = new WeakMap<AbstractControl, string>();
  radioGroupCounter = 0;

  ngOnInit(): void {
    this.activatedRouter.paramMap.subscribe((params)=>{
      this.projectId = params.get("id") || "";
      this.projectService.getById(this.projectId).subscribe(
        data =>{
          //console.log('projects: ',data);
          this.activeProject =data; 

          if(this.activeProject.schema){
            const parser = new XMLParser({
              ignoreAttributes: false,
              attributeNamePrefix : "@_",
              removeNSPrefix: true,
              isArray: (name:any) => ['element', 'attribute', 'enumeration'].includes(name)
            });
            const jObj = parser.parse(this.activeProject.schema);
            this.schema=this.formGenerator.parseXsd(jObj);
            this.form =this.formGenerator.buildForm(this.schema) as FormGroup;
            this.cdr.detectChanges();
          };
          
        },
        error =>{
          console.error("error: "+ error);
        }
      );
    });

  }
  
  generateSubmission(){
    
    // If they dont exist dont bother
    if (!this.form || !this.schema || this.isSubmitted) {
      return;
    }
    // Run validation and display errors
    this.showValidationErrors = true;
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    // Stop if the form is invalid
    if (this.form.invalid) {
      console.log("not through");
      this.xmlOutput = '';
      //this.cdr.detectChanges();
      return;
    }

    
    // Generate XML only when the form is valid
    this.xmlOutput = this.formGenerator.generateXml(
      this.schema,
      this.form.value
    );
    this.filledForms.form =this.xmlOutput;
    this.filledForms.formCreator= this.activeProject.user;
    this.filledForms.schema = this.activeProject._id;
    
    this.filledFormsService.postXml(this.filledForms).subscribe(
        data =>{ 
          this.isSubmitted = true;
          //this.cdr.detectChanges();
          this.cdr.markForCheck();
        },
        error =>{
          console.error('HTTP error:', error);
          console.error('Status:', error.status);
          console.error('Backend response:', error.error);
        }
      );
    
    
  }

  asGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  asArray(ctrl: AbstractControl): FormArray {
    return ctrl as FormArray;
  }

  asControl(ctrl: AbstractControl): FormControl {
    return ctrl as FormControl;
  }

  getControl(group: AbstractControl, key: string | number | symbol): AbstractControl {
    return (group as FormGroup).get(String(key))!;
  }

  getAttributeControl(group: AbstractControl, key: string | number | symbol): AbstractControl {
    return (group as FormGroup).get('@' + String(key))!;
  }

  getRadioGroupName(control: AbstractControl): string {
    let name = this.radioGroupNames.get(control);
    if (!name) {
      name = `radio-group-${++this.radioGroupCounter}`;
      this.radioGroupNames.set(control, name);
    }
    return name;
  }

  // ---- array helper ----

  trackByKey(index: number, item: [string, FormSchema]): string {
    return item[0];
  }

  trackByAttribute(index: number, item: KeyValue<string | number | symbol, any>): string | number | symbol {
    return item.key;
  }

  addItem(array: FormArray, schema: FormSchema) {
    const arraySchema = schema as FormArraySchema;

    const maxItems = arraySchema.maxItems;

    if (maxItems !== undefined && array.length >= maxItems) {
      return;
    }

    array.push(this.formGenerator.buildForm(arraySchema.item));
  }

  removeItem(array: FormArray, schema: FormSchema, index: number) {
    const arraySchema = schema as FormArraySchema;

    const minItems = arraySchema.minItems ?? 0;

    if (array.length <= minItems) {
      return;
    }

    array.removeAt(index);
  }

  getSimpleControls(controls: Record<string, FormSchema>): [string, FormSchema][] {
    return Object.entries(controls)
      .filter(([_, schema]) => schema.type !== 'array' && schema.type !== 'group');
  }

  getArrayControls(controls: Record<string, FormSchema>): [string, FormSchema][] {
    return Object.entries(controls)
      .filter(([_, schema]) => schema.type === 'array');
  }

  getComplexControls(controls: Record<string, FormSchema>): [string, FormSchema][] {
    return Object.entries(controls)
      .filter(([_, schema]) => schema.type === 'group');
  }

  selectCheckboxOption(control: FormControl, option: string): void {
    if (control.value === option) 
      { control.setValue(null); } 
    else 
      { control.setValue(option); }
  }

}
