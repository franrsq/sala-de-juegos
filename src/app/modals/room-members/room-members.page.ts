import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-room-members',
  templateUrl: './room-members.page.html',
  styleUrls: ['./room-members.page.scss'],
})
export class RoomMembersPage implements OnInit {

  @Input() roomId: string;
  items: any[] = [];

  constructor(private modalController: ModalController, private firebaseService: FirebaseService) { }

  ngOnInit() {
    this.firebaseService.observeRoomMembers(this.roomId).subscribe((members: any) => {
      this.items = Object.keys(members).map((userId: any) => {
        return this.firebaseService.observePlayerData(userId).pipe(map(user => {
          return user;
        }));
      });
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
