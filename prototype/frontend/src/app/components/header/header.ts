import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../services/account';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit{
  private accountService = inject(AccountService);
  private router = inject(Router); 

  ngOnInit(): void{
    
  };

  logOut(){
    this.accountService.getLogout().subscribe(
      data =>{
        this.router.navigate(['/']);
      }
    )
  }
}
