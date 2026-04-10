import { Component, inject, OnInit, ElementRef} from '@angular/core';
import { AccountService } from '../../services/account';
import {User} from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration implements OnInit {
  private accountService = inject(AccountService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);


  registrationForm !: FormGroup;
  nameError !: Element;
  passwordError !: Element;

  ngOnInit(): void{
    this.nameError = this.elementRef.nativeElement.querySelector('.name.error');
    this.passwordError = this.elementRef.nativeElement.querySelector('.password.error');
    this.registrationForm = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.minLength(4)]),
      password: new FormControl('',[Validators.required,Validators.minLength(8)])
    });
  };
  

  sendRegistration(){
      this.nameError!.textContent = "";
      this.passwordError!.textContent ="";
      this.accountService.postSignup(this.registrationForm.value).subscribe(
        data => {
          console.log(data.user);
          if(data.user){
            this.router.navigate(['/']);
          }
        },
        error => {
          console.log('error', error.error.errors);
          this.nameError!.textContent = error.error.errors.name;
          this.passwordError!.textContent = error.error.errors.password;
        }
      );
  };

}
