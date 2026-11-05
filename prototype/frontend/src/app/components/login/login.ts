import { Component, ElementRef, inject, OnInit } from '@angular/core';
import { AccountService } from '../../services/account';
import {User} from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit{
  private accountService = inject(AccountService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  loginForm !: FormGroup;
  loginError !: Element;

  ngOnInit(): void{
    this.loginError = this.elementRef.nativeElement.querySelector('.error');
    this.loginForm = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.minLength(4)]),
      password: new FormControl('',[Validators.required,Validators.minLength(8)])
    });
  };


  onSubmit(){
      this.loginError!.textContent = "";
      this.accountService.postLogin(this.loginForm.value).subscribe(
        data => {
          console.log(data.user);
          if(data.user){
            this.router.navigate(['/']);
          }
        },
        error => {
          this.loginError!.textContent = "Account not found";
        }
      )
  };

}
