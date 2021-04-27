import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoomMembersPageRoutingModule } from './room-members-routing.module';

import { RoomMembersPage } from './room-members.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoomMembersPageRoutingModule
  ],
  declarations: [RoomMembersPage]
})
export class RoomMembersPageModule {}
