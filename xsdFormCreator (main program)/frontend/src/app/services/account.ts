import { Injectable,PLATFORM_ID,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {User} from '../models/user.model'
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private api = `${environment.apiUrl}/users`;

  private loggedIn = new BehaviorSubject<boolean>(false);
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient){
    if (isPlatformBrowser(this.platformId)) {
      this.loadUser();
    }
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

  postLogout():Observable<any>{
    return this.http.post<void>(this.api + '/logout',{},{
      withCredentials: true
    });
  };

  getUser():Observable<any>{
    return this.http.get<{ user?: User }>(this.api + '/user',{
      withCredentials: true
    });
  };


  loadUser(): void {
    this.getUser().subscribe({
      next: (data) => {
        const isLogged = !!data?.user;
        //console.log(data?.user);
        this.loggedIn.next(isLogged);
      },
      error: () => {
        this.loggedIn.next(false);
      }
    });
  };

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  };

  setLoginState(isLoggedIn: boolean): void {
    this.loggedIn.next(isLoggedIn);
  }

}