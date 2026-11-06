import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FilledFormsService } from '../../services/filled-forms';
import { ActivatedRoute } from '@angular/router';
import { FilledForms } from '../../models/filledForms.model';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-submittedprojects',
  imports: [CommonModule],
  templateUrl: './submittedprojects.html',
  styleUrl: './submittedprojects.css',
})
export class Submittedprojects implements OnInit{
  private filledFormsService = inject(FilledFormsService);
  private activatedRouter = inject(ActivatedRoute);
  private changeDetector = inject(ChangeDetectorRef);

  projectId = "";
  responses : FilledForms[] | null = null;

  ngOnInit(): void {
    this.activatedRouter.paramMap.subscribe((params)=>{
      this.projectId = params.get("id") || "";
      this.filledFormsService.getBySchema(this.projectId).subscribe(
        data =>{
          console.log('projects: ',data);
          this.responses =data; 
          this.changeDetector.detectChanges();

        },
        error =>{
          console.error("error: "+ error);
        }
      );
    });
  }



  downloadXml(content:string){
    const blob= new Blob([content],{type: 'text/plain;charset=utf-8'})
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download ="xmlForm.xml";

    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
