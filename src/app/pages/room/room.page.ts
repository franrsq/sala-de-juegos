import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { combineLatest, of, Subject, zip } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { NewGamePage } from 'src/app/modals/new-game/new-game.page';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Capacitor } from '@capacitor/core';
import { ClipboardService } from 'ngx-clipboard';
import { RoomMembersPage } from 'src/app/modals/room-members/room-members.page';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit, OnDestroy {
  private unsubscribe = new Subject<void>();
  roomId: string;
  roomName = "";
  users;
  matches: any[] = [];
  waitingList: any[] = [];

  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private firebaseService: FirebaseService,
    private route: ActivatedRoute,
    private clipboard: Clipboard,
    private clipboardService: ClipboardService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
    this.observeRoomData();
    this.observeMatchesList();
    this.observeWaitingList();
    this.observePlayerState();
    this.firebaseService.observeConnectedUsers(this.roomId).subscribe(data => this.users = data);
  }

  observeRoomData() {
    this.firebaseService.observeRoomData(this.roomId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(async (room: any) => {
        if (room) {
          this.roomName = room.name;
          this.users = room.members ? Object.keys(room.members).length : 0;
        } else {
          const toast = await this.toastController.create({
            message: 'No se pudo cargar la informacíon',
            duration: 2000,
            color: "danger"
          });
          toast.present();
          this.router.navigate(['/home']);
        }
      });
  }

  observeMatchesList() {
    this.firebaseService.observeMatchesList(this.roomId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((matches: any) => {
        if (matches) {
          this.matches = Object.values(matches).map((match: any, index) => {
            let p1Obs, p2Obs;
            if (match.p1uid == 0 || match.p1uid == 1 || match.p1uid == 2) {
              p1Obs = of({ nickname: 'IA' });
            } else {
              p1Obs = this.firebaseService.observePlayerData(match.p1uid);
            }
            if (match.p2uid == 0 || match.p2uid == 1 || match.p2uid == 2) {
              p2Obs = of({ nickname: 'IA' });
            } else {
              p2Obs = this.firebaseService.observePlayerData(match.p2uid);
            }
            return combineLatest([p1Obs, p2Obs]).pipe(map(players => {
              match['player1'] = players[0];
              match['player2'] = players[1];
              return match;
            }));
          });
        } else {
          this.matches = [];
        }
      });
  }

  observeWaitingList() {
    this.firebaseService.observeWaitingList(this.roomId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((waitingList: any) => {
        if (waitingList) {
          this.waitingList = Object.values(waitingList).map((waitingData: any, index) => {
            return this.firebaseService.observePlayerData(waitingData.player).pipe(map(player => {
              waitingData['id'] = Object.keys(waitingList)[index];
              return Object.assign({}, player, waitingData);
            }));
          });
        } else {
          this.waitingList = [];
        }
      });
  }

  async observePlayerState() {
    (await this.firebaseService.observePlayerStates()).pipe(
      takeUntil(this.unsubscribe),
      switchMap((state: any) => {
        if (state?.game) {
          return this.firebaseService.getGameInfo(this.roomId, state.game);
        }
        return of(null);
      })
    ).subscribe((gameInfo: any) => {
      if (gameInfo) {
        this.router.navigate(['/game-board', this.roomId, gameInfo.game, gameInfo.rows, gameInfo.cols]);
      }
    });
  }

  async copyCode() {
    if (Capacitor.isNative) {
      this.clipboard.copy(this.roomId);
    } else {
      this.clipboardService.copy(this.roomId);
    }
    const toast = await this.toastController.create({
      message: 'Código copiado',
      duration: 2000,
      color: "success"
    });
    toast.present();
  }

  showMatch(item: any) {
    this.router.navigate(['/game-board', this.roomId, item.game, item.rows, item.cols]);
  }

  async showUsers() {
    const modal = await this.modalController.create({
      component: RoomMembersPage,
      componentProps: {
        'roomId': this.roomId
      }
    });
    modal.present();
  }

  async joinDialog(item: any) {
    const alert = await this.alertController.create({
      header: "¿Desea unirse a la partida de " + item.nickname + "?",
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Unirme',
          handler: () => {
            this.joinMatch(item.id);
          }
        }
      ]
    });
    await alert.present();
  }

  async joinMatch(id) {
    this.firebaseService.sendGameCommand({
      command: 'join',
      room: this.roomId,
      matchingId: id
    });
  }

  async createMatchModal() {
    const modal = await this.modalController.create({
      component: NewGamePage
    });
    modal.onDidDismiss().then(data => {
      const matchData = data.data;
      if (matchData) {
        if (matchData.multiplayer) {
          this.firebaseService.sendGameCommand({
            command: 'match',
            room: this.roomId,
            rows: matchData.boardSize,
            columns: matchData.boardSize,
            wantsToStart: matchData.wantsToStart
          });
        } else {
          this.firebaseService.sendGameCommand({
            command: 'play_ai',
            room: this.roomId,
            rows: matchData.boardSize,
            columns: matchData.boardSize,
            aiType: matchData.difficulty,
            wantsToStart: matchData.wantsToStart
          });
        }
      }
    })
    modal.present();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
