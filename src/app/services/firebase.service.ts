import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { combineLatest, Observable, of, zip } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private database: AngularFireDatabase, private auth: AuthService,
    private afAuth: AngularFireAuth) {

    this.updateOnUser().subscribe();
    this.updateOnDisconnect().subscribe();
  }

  updateOnUser() {
    const connection = this.database.object('.info/connected').valueChanges();

    return this.afAuth.authState.pipe(
      switchMap(user => user ? connection : of(false)),
      tap((online: boolean) => this.setPresence(online))
    );
  }

  updateOnDisconnect() {
    return this.afAuth.authState.pipe(
      tap(user => {
        if (user) {
          const pushId = this.database.createPushId();
          this.database.object(`commands/checkers/${user.uid}/${pushId}`).set({
            command: 'disconnect'
          });
          this.database.object(`users/${user.uid}`).query.ref.onDisconnect()
            .update({
              online: false,
            });
        }
      })
    );
  }

  observeGame(gameId) {
    return this.database.object(`games/checkers/${gameId}`).valueChanges();
  }

  async sendGameCommand(command: {}) {
    const pushId = this.database.createPushId();
    return this.database.object(`commands/checkers/${(await this.auth.getUser()).uid}/${pushId}`).set(command);
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

  observeRoomMembers(roomId) {
    return this.database.object(`rooms/${roomId}/members`).valueChanges();
  }

  observeConnectedUsers(roomId) {
    return this.database.object(`rooms/${roomId}/members`).valueChanges().pipe(
      switchMap((members: any) => {
        if (members) {
          const membersObs: Observable<unknown>[] =
            Object.keys(members).map(uid => this.observePlayerData(uid));
          return combineLatest(membersObs).pipe(map(users => {
            // users connected/total users
            return `${users.filter((user: any) => user.online).length}/${users.length}`
          }));
        }
        return of('0/0');
      })
    );
  }

  getGameInfo(roomId, gameId) {
    return this.database.object(`game-room/${roomId}/${gameId}`).valueChanges().pipe(take(1));
  }

  async getUser() {
    return this.auth.getUser();
  }

  async setPresence(online: boolean) {
    const user = await this.auth.getUser();
    if (user) {
      if (!online) {
        const pushId = this.database.createPushId();
        this.database.object(`commands/checkers/${user.uid}/${pushId}`).set({
          command: 'disconnect'
        });
      }
      return this.database.object(`users/${user.uid}`).update({
        online: online
      });
    }
  }
}
