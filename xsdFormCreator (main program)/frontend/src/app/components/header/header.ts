import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../services/account';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterModule,CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit{
  private accountService = inject(AccountService);
  private router = inject(Router); 
  private changeDetector = inject(ChangeDetectorRef);

  isLoggedIn: boolean = false;
  private authSub?: Subscription;

  //isLoggedIn = this.accountService.isLoggedIn().subscribe;

  ngOnInit(): void{
    this.authSub = this.accountService.isLoggedIn().subscribe(data=>{
      this.isLoggedIn = data;
      this.changeDetector.markForCheck();
    });
  };

  logOut(){
    this.accountService.postLogout().subscribe(
      data =>{
        this.accountService.loadUser();
        this.router.navigate(['/login']);
        this.changeDetector.detectChanges();
      }
    )
  }
}
