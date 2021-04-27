import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-new-game',
  templateUrl: './new-game.page.html',
  styleUrls: ['./new-game.page.scss'],
})
export class NewGamePage implements OnInit {

  boardSize = 8;
  wantsToStart = true;
  multiplayer = true;
  difficulty = 0;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    this.modalController.dismiss({
      boardSize: this.boardSize,
      wantsToStart: this.wantsToStart,
      multiplayer: this.multiplayer,
      difficulty: this.difficulty
    });
  }
}
