import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { ProjectsService } from '../../services/projects';
import { Project } from '../../models/projects.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-projects',
  imports: [CommonModule,RouterModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  private projectService = inject(ProjectsService);
  private changeDetector = inject(ChangeDetectorRef);


  projects: Project[] | null = null;;

  
  ngOnInit(): void {
    this.initData();
  }

  initData(): void{
    this.projectService.getByUser().subscribe(
        data =>{
          console.log('projects: ',data);
          this.projects =data; 
          this.changeDetector.detectChanges();

        },
        error =>{
          console.error("error: "+ error);
        }
      );
  }

  onDeleteClick(schema: Project){
    if(window.confirm("Are you sure you want to delete the schema: "+ schema.schema + "?")){
      this.projectService.delete(schema._id).subscribe(
        data =>{
          this.initData();
        },
        error =>{
          console.error("error: "+ error);
        }
      )
    }
  }

}
