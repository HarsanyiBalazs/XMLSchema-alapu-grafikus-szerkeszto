import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {User} from '../models/user.model'



@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private api = "http://localhost:3000/users";

  private loginState = false;

  loggedIn = new BehaviorSubject<boolean>(this.hasCookie());

  constructor(private http: HttpClient){

  };


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
    return this.http.get<boolean>(this.api + '/user',{
      withCredentials: true
    });
  };


  loadUser(): void {
    this.getUser().subscribe(
      data => this.loginState = !!data.user,
      () => this.loginState = false
    );
  };

  hasCookie(): boolean {
    return this.loginState;
  };

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  };

  refreshAuthState() {
    this.loggedIn.next(this.hasCookie());
  };
}



