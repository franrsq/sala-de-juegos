import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { forkJoin, merge, of } from 'rxjs';
import { first, map, mergeAll, mergeMap, switchAll, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private database: AngularFireDatabase, private auth: AuthService) { }

  observeGame(gamePath, gameId) {
    return this.database.object(`games/${gamePath}/${gameId}`).valueChanges();
  }

  sendGameCommand(gamePath, command: {}) {
    const pushId = this.database.createPushId();
    return this.database.object(`commands/${gamePath}/${this.auth.currentUser.uid}/${pushId}`).set(command);
  }

  observePlayerStates() {
    return this.database.object(`player_states/${this.auth.currentUser.uid}`).valueChanges();
  }

  getPlayerData(uid: string) {
    return this.database.object(`users/${uid}`).valueChanges().pipe(take(1));
  }

  sendRoomCommand(command: {}) {
    const pushId = this.database.createPushId();
    return this.database.object(`commands/room/${this.auth.currentUser.uid}/${pushId}`).set(command);
  }

  getUserRooms() {
    const uid = JSON.parse(localStorage.getItem("uid"));
    return this.database.object(`userRooms/${uid}`).valueChanges();
  }

  getRoomData(id) {
    return this.database.object(`rooms/${id}`).valueChanges();
  }
}
