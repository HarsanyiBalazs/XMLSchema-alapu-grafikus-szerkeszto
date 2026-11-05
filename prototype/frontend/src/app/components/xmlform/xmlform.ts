import { Component, inject, OnInit } from '@angular/core';
import { ProjectsService } from '../../services/projects';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../../models/projects.model';
import { error } from 'console';

@Component({
  selector: 'app-xmlform',
  imports: [ReactiveFormsModule],
  templateUrl: './xmlform.html',
  styleUrl: './xmlform.css',
})
export class Xmlform {
  private projectService = inject(ProjectsService);
  private activatedRouter = inject(ActivatedRoute);

  xmlSchemaForm !: FormGroup;
  projectId = "";
  activeProject !: Project;

  ngOnInit(): void {
    this.activatedRouter.paramMap.subscribe((params)=>{
      this.projectId = params.get("id") || "";
    });

    this.xmlSchemaForm = new FormGroup({
      name: new FormControl(''),
      schema: new FormControl('')
    });

    this.projectService.getById(this.projectId).subscribe(
      data =>{
        this.xmlSchemaForm.patchValue(data);
      },
      error =>{
        console.log(error);
      }
    );

  };

  updateSchema(){
    this.projectService.patch(this.projectId,this.xmlSchemaForm.value).subscribe(
      data =>{

      },
      error =>{
        console.log(error);
      }
    );
  };

  generateForm(){

  }

}
