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

  async sendGameCommand(gamePath, command: {}) {
    const pushId = this.database.createPushId();
    return this.database.object(`commands/${gamePath}/${(await this.auth.getUser()).uid}/${pushId}`).set(command);
  }

  async observePlayerStates() {
    return this.database.object(`player_states/${(await this.auth.getUser()).uid}`).valueChanges();
  }

  getPlayerData(uid: string) {
    return this.database.object(`users/${uid}`).valueChanges().pipe(take(1));
  }

  async sendRoomCommand(command: {}) {
    const pushId = this.database.createPushId();
    return this.database.object(`commands/room/${(await this.auth.getUser()).uid}/${pushId}`).set(command);
  }

  async observeUserRooms() {
    return this.database.object(`userRooms/${(await this.auth.getUser()).uid}`).valueChanges();
  }

  observeRoomData(id) {
    return this.database.object(`rooms/${id}`).valueChanges();
  }

  observePlayerData(uid) {
    return this.database.object(`users/${uid}`).valueChanges();
  }

  observeMatchesList(roomId) {
    return this.database.object(`game-room/${roomId}`).valueChanges();
  }

  observeWaitingList(roomId) {
    return this.database.object(`matching/${roomId}`).valueChanges();
  }
}
