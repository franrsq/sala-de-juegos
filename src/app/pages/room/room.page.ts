import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {

  constructor(
    private alertController: AlertController
  ) { }

  items: any[] = [
    {player1:"Jairo", player2:"Croqui", isPlaying:true, boardSize:8, turn:"primero"},
    {player1:"Sebas", player2:"...", isPlaying:false, boardSize:8,turn:"segundo"}
  ];
  codeRoom = 1234;
  nameRoom = "Nombre de la sala";
  Users = "10/20";

  ngOnInit() {
  }

  showMatch(item:any){
    // llamar a espectar una partida
  }

  showUsers(){
    //mostrar la lista de usuarios
  }

  joinMatch(item:any){
    this.joinDialog(item);
  }

  async joinDialog(item:any) {
    const alert = await this.alertController.create({
      header: "¿Desea unirse a la partida de "+item.player1+"?",
      message: "Tablero tamaño "+item.boardSize+", juega de "+item.turn,
      //backdropDismiss: false,
      buttons: [
        {
          text: 'Unirse',
          handler: (data) => {
            return true;
          }
        },
        {
          text:"Cancelar",
          handler: (data) => {
            return true;
          }
        }
      ]
    });
    await alert.present();
  }
}
