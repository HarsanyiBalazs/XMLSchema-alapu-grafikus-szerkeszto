import { Component, inject, OnInit} from '@angular/core';
import { AccountService } from '../../services/account';
import {User} from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration implements OnInit {
  private accountService = inject(AccountService);
  private router = inject(Router);


  registrationForm !: FormGroup;
  showValidationErrors = false;
  serverErrors: { [key: string]: string } = {};

  ngOnInit(): void{

    this.registrationForm = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.minLength(4)]),
      password: new FormControl('',[Validators.required,Validators.minLength(8)])
    });
  };
  

  sendRegistration(){
    this.showValidationErrors = true;
    this.serverErrors = {};
    
    this.registrationForm.markAllAsTouched();
    this.registrationForm.updateValueAndValidity();

    if (this.registrationForm.invalid) {
      return;
    }

    this.accountService.postSignup(this.registrationForm.value).subscribe(
        data => {
          console.log(data.user);
          this.accountService.setLoginState(true);
          if(data.user){
            this.router.navigate(['/']);
          }
        },
        error => {
          console.log('error', error.error.errors);
          this.serverErrors = error.error?.errors ?? {};
          /*this.nameError!.textContent = error.error.errors.name;
          this.passwordError!.textContent = error.error.errors.password;*/
        }
      );
  };

}
