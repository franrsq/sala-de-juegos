import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoomMembersPage } from './room-members.page';

const routes: Routes = [
  {
    path: '',
    component: RoomMembersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomMembersPageRoutingModule {}
