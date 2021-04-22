import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) { }

  items: any[] = [
    { name: 'Hola', description: 'Hola' }
  ];

  ngOnInit() {
    const nickname = JSON.parse(localStorage.getItem('nickname'));
    if (!nickname) {
      this.nicknameDialog();
    }
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

  async confirmAbandonRoom() {
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

          }
        }
      ]
    });

    await alert.present();
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
