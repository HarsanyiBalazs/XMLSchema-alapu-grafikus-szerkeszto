import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Project} from '../models/projects.model'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private api = "http://localhost:3000/projects"

  constructor(private http: HttpClient){

  }

  /*get(): Observable<Project[]>{
    return this.http.get<Project[]>(this.api,{
      withCredentials: true
    });
  }*/

  getByUser(): Observable<Project[]>{
    return this.http.get<Project[]>(this.api + '/user',{
      withCredentials: true
    });
  }

  getById(id:string): Observable<Project>{
    return this.http.get<Project>(this.api + '/' + id,{
      withCredentials: true
    });
  }

  post(project:Project):Observable<Project>{
    return this.http.post<Project>(this.api,project,{
      withCredentials: true
    });
  }

  patch(id: string,project:Project):Observable<Project>{
    return this.http.patch<Project>(this.api + '/patch/' + id,project,{
      withCredentials: true
    });
  }

  delete(id:string):Observable<Project>{
    return this.http.delete<Project>(this.api + '/' + id,{
      withCredentials: true
    });
  }
  
}
