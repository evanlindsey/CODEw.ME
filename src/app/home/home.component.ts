import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <div class="home container-fluid">
      <br /><br />
      <h1>&#60;ＣＯＤＥｗ.ＭＥ&#62;</h1>
      <br /><br />
      <input (keydown)="goToRoom($event)" [(ngModel)]="roomName" placeholder="ROOM NAME" maxlength="31">
      <br /><br />
      <button (click)="goToRoom()" type="button" class="btn btn-primary btn-lg">JOIN</button>
      <br /><br />
      <span><u>Notice:</u> This app is in development. User data (your code) may be cleared at any time.</span>
    </div>
  `,
  styles: [`
    .home {
      text-align: center;
    }
    h1 {
      font-size: 10vw;
    }
    input {
      width: 280px;
      height: 40px;
      border: none;
      font-size: 150%;
      text-align: center;
    }
  `]
})
export class HomeComponent {

  roomName = '';

  constructor(private router: Router) { }

  goToRoom(event?: KeyboardEvent): void {
    if (event && event.key !== 'Enter') {
      return;
    }
    if (this.roomName !== '') {
      this.router.navigate(['/room', this.roomName]);
    }
  }

}
