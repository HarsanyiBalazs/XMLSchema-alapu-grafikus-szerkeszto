import { Component, inject, OnInit } from '@angular/core';
import { ProjectsService } from '../../services/projects';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule,Validators } from '@angular/forms';

@Component({
  selector: 'app-createxmlform',
  imports: [ReactiveFormsModule],
  templateUrl: './createxmlform.html',
  styleUrl: './createxmlform.css',
})
export class Createxmlform implements OnInit{
  private projectService = inject(ProjectsService);
  private router = inject(Router);

  xmlSchemaForm !: FormGroup;
  fileError = '';

  ngOnInit(): void {
      this.xmlSchemaForm = new FormGroup({
        name: new FormControl('',Validators.required),
        schema: new FormControl('',Validators.required)
      });
  }

  sendSchema(){
    this.projectService.post(this.xmlSchemaForm.value).subscribe(
      data =>{
        this.router.navigate(['/formeditor/' + data._id]);
      },
      error =>{
        console.log(error.error);
      }
    );
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.fileError = '';

    if (!file) {
      return;
    }

    // Only accept text and XSD files.
    const allowedExtensions = ['txt', 'xsd'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      this.fileError = 'Please select a .txt or .xsd file.';
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.xmlSchemaForm.get('schema')?.setValue(
        reader.result as string
      );
      this.xmlSchemaForm.get('schema')?.markAsDirty();
      this.xmlSchemaForm.get('schema')?.markAsTouched();
    };

    reader.onerror = () => {
      this.fileError = 'The file could not be read.';
    };

    reader.readAsText(file);
  }

}
