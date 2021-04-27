import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewGamePageRoutingModule } from './new-game-routing.module';

import { NewGamePage } from './new-game.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewGamePageRoutingModule
  ],
  declarations: [NewGamePage]
})
export class NewGamePageModule {}
