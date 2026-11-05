import { Component, inject, OnInit } from '@angular/core';
import { ProjectsService } from '../../services/projects';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

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

  ngOnInit(): void {
      this.xmlSchemaForm = new FormGroup({
        name: new FormControl(''),
        schema: new FormControl('')
      });
  }

  sendSchema(){
    this.projectService.post(this.xmlSchemaForm.value).subscribe(
      data =>{
        this.router.navigate(['/form/' + data._id]);
      },
      error =>{
        console.log(error.error);
      }
    );
  }
  
}
