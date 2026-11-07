import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { AccountService } from '../../services/account';
import {User} from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit{
  private accountService = inject(AccountService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);


  loginForm !: FormGroup;
  showValidationErrors = false;
  serverError = '';

  ngOnInit(): void{
    this.loginForm = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.minLength(4)]),
      password: new FormControl('',[Validators.required,Validators.minLength(8)])
    });
  };


  onSubmit(){
    this.showValidationErrors = true;
    this.serverError = '';

    this.loginForm.markAllAsTouched();
    this.loginForm.updateValueAndValidity();

    if (this.loginForm.invalid) {
      return;
    }

    this.accountService.postLogin(this.loginForm.value).subscribe(
        data => {
          console.log(data.user);
          this.accountService.setLoginState(true);
          if(data.user){
            this.router.navigate(['/']);
          }
        },
        error => {
          this.serverError = "A fiók nem található.";
          this.cdr.markForCheck();
        }
      )
  };

}
