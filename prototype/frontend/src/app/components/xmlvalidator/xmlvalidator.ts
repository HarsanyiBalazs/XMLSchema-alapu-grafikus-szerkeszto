import { Component, ElementRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { XmlDocument, XsdValidator } from 'libxml2-wasm';

@Component({
  selector: 'app-xmlvalidator',
  imports: [ReactiveFormsModule],
  templateUrl: './xmlvalidator.html',
  styleUrl: './xmlvalidator.css',
})
export class Xmlvalidator implements OnInit{
  private elementRef = inject(ElementRef);
  
  xmlForm !: FormGroup;
  resultBox !: Element;

  ngOnInit(): void{
    this.xmlForm = new FormGroup({
      schema: new FormControl(''),
      xml: new FormControl('')
    });
    this.resultBox = this.elementRef.nativeElement.querySelector('#result');
  }

  validateXml(){

    this.resultBox.textContent = "";

    
    const doc = XmlDocument.fromString(this.xmlForm.get('xml')!.value);
    const schema = XmlDocument.fromString(this.xmlForm.get('schema')!.value);
    const validator = XsdValidator.fromDoc(schema);

    try {
      validator.validate(doc);
      this.resultBox.textContent = "The file is valid";
    } catch (error:any) {
      console.log(error);
      this.resultBox.textContent = error;
    }
    doc.dispose();
    validator.dispose();
    schema.dispose();

  }
}
