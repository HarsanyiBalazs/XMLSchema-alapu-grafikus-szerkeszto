import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FilledForms } from '../models/filledForms.model';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class FilledFormsService {
  private api = `${environment.apiUrl}/filledForms`;

  constructor(private http: HttpClient){

  }

  getBySchema(schema:string): Observable<FilledForms[]>{
    return this.http.get<FilledForms[]>(this.api + '/' + schema,{
      withCredentials: true
    });
  };

  postXml(schema:FilledForms):Observable<FilledForms>{
    return this.http.post<FilledForms>(this.api + '/public',schema,{
      withCredentials: true
    });
  }

  /*postPrivate(schema:FilledForms):Observable<FilledForms>{
    return this.http.post<FilledForms>(this.api+ 'private',schema,{
      withCredentials: true
    });
  }*/

  delete(id:string):Observable<FilledForms>{
      return this.http.delete<FilledForms>(this.api + '/' + id,{
        withCredentials: true
      });
   }
}
