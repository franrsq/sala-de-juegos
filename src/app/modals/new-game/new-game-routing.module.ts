import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewGamePage } from './new-game.page';

const routes: Routes = [
  {
    path: '',
    component: NewGamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewGamePageRoutingModule {}
