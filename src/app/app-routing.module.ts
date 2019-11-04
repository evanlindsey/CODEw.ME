import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RoomComponent } from './room/room.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'room', redirectTo: '', pathMatch: 'full' },
  { path: 'room/:name', component: RoomComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
