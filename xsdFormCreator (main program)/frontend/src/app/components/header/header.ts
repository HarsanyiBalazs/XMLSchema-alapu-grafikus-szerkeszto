import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
  private changeDetector = inject(ChangeDetectorRef);

  isLoggedIn!: boolean;

  //isLoggedIn = this.accountService.isLoggedIn().subscribe;

  ngOnInit(): void{
    this.accountService.loadUser();
    this.accountService.refreshAuthState();
    this.accountService.isLoggedIn().subscribe(data=>{
      this.isLoggedIn = data;
      this.changeDetector.detectChanges();
    });
  };

  logOut(){
    this.accountService.getLogout().subscribe(
      data =>{
        /*this.accountService.loadUser();
        this.accountService.refreshAuthState();*/
        this.accountService.loggedIn.next(false);
        this.router.navigate(['/login']);
        this.changeDetector.detectChanges();
      }
    )
  }
}
