import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {User} from '../models/user.model'


@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private api = "http://localhost:3000/users"

  constructor(private http: HttpClient){

  }

  postSignup(user:User):Observable<any>{
    return this.http.post<User>(this.api + '/signup',user,{
      withCredentials: true
    });
  };
  
  postLogin(user:User):Observable<any>{
    return this.http.post<User>(this.api + '/login',user,{
      withCredentials: true
    });
  };

  getLogout():Observable<any>{
    return this.http.get<void>(this.api + '/logout',{
      withCredentials: true
    });
  };

  getUser():Observable<any>{
    return this.http.get<string>(this.api + '/user',{
      withCredentials: true
    });
  };

}
