import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { NewGamePage } from 'src/app/modals/new-game/new-game.page';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {

  constructor(
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  items: any[] = [
    { player1: "Jairo", player2: "Croqui", isPlaying: true, boardSize: 8, turn: "primero" },
    { player1: "Sebas", player2: "...", isPlaying: false, boardSize: 8, turn: "segundo" }
  ];
  codeRoom = 1234;
  nameRoom = "Nombre de la sala";
  Users = "10/20";

  ngOnInit() {
  }

  showMatch(item: any) {
    // llamar a espectar una partida
  }

  showUsers() {
    //mostrar la lista de usuarios
  }

  async joinDialog(item: any) {
    const alert = await this.alertController.create({
      header: "¿Desea unirse a la partida de " + item.player1 + "?",
      message: "Tablero " + item.boardSize + "x" + item.boardSize + "<br>Juega de " + item.turn,
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Unirme',
          handler: (data) => {
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async createMatchModal() {
    const modal = await this.modalController.create({
      component: NewGamePage
    });
    modal.onDidDismiss().then(data => {
      if (data.data) {
        
      }
    })
    return await modal.present();
  }
}
