import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  private unsubscribe = new Subject<void>();

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private alertController: AlertController
  ) { }

  items: any[] = [];

  ngOnInit() {
    const nickname = JSON.parse(localStorage.getItem('nickname'));
    if (!nickname) {
      this.nicknameDialog();
    }
    this.firebaseService.getUserRooms()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(rooms => this.items = rooms);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  async nicknameDialog() {
    const alert = await this.alertController.create({
      header: 'Nickname',
      message: "Escribe tu nickname",
      backdropDismiss: false,
      inputs: [
        {
          name: 'nickname',
          type: 'text',
          placeholder: 'Nickname'
        }
      ],
      buttons: [
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.nickname) {
              alert.message = 'Ingrese un nickname.';
              return false;
            }
            this.authService.saveNickname(data.nickname);
          }
        }
      ]
    });

    await alert.present();
  }

  logout() {
    this.authService.signOut();
  }

  enterRoom() {

  }

  async confirmAbandonRoom(room) {
    const alert = await this.alertController.create({
      header: 'Abandonar sala',
      message: '¿Está seguro de que desea abandonar la sala?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Si',
          handler: () => {
            this.abandonRoom(room);
          }
        }
      ]
    });

    await alert.present();
  }

  abandonRoom(room) {
    this.firebaseService.sendRoomCommand({
      command: 'exit',
      roomId: room.id
    });
  }

  async createRoomDialog() {
    const alert = await this.alertController.create({
      header: 'Crear nueva sala',
      inputs: [
        {
          name: 'roomName',
          type: 'text',
          placeholder: 'Nombre de la sala'
        },
        {
          name: 'roomDescription',
          type: 'text',
          placeholder: 'Descripción de la sala'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Crear',
          handler: (data) => {
            if (!data.roomName) {
              alert.message = 'Ingrese el nombre de la sala.';
              return false;
            }
            if (!data.roomDescription) {
              alert.message = 'Ingrese la descripción de la sala.';
              return false;
            }
            this.createRoom(data.roomName, data.roomDescription);
          }
        }
      ]
    });

    await alert.present();
  }

  private createRoom(roomName, roomDescription) {
    this.firebaseService.sendRoomCommand({
      command: 'new',
      name: roomName,
      description: roomDescription
    });
  }

  async joinRoomDialog() {
    const alert = await this.alertController.create({
      header: 'Unirse a una sala',
      inputs: [
        {
          name: 'roomCode',
          type: 'text',
          placeholder: 'Código de la sala'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Crear',
          handler: (data) => {
            if (!data.roomCode) {
              alert.message = 'Ingrese el código de la sala.';
              return false;
            }
            this.joinRoom(data.roomCode);
          }
        }
      ]
    });

    await alert.present();
  }

  joinRoom(roomCode) {

  }

}
