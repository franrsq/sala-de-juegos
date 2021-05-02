import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { BoardManager } from 'src/app/game/board-manager';
import { CheckersEngine } from 'src/app/game/checkers/checkers-engine';
import { CheckersBoardStyle } from 'src/app/game/checkers/checkers-style';
import { Engine } from 'src/app/game/engine';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.page.html',
  styleUrls: ['./game-board.page.scss'],
})
export class GameBoardPage implements OnInit, OnDestroy {
  boardManager: BoardManager;
  roomId;

  constructor(
    private firebaseService: FirebaseService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) { }


  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
    const gameId = this.route.snapshot.paramMap.get('gameId');
    const rows = parseInt(this.route.snapshot.paramMap.get('rows'));
    const cols = parseInt(this.route.snapshot.paramMap.get('cols'));

    this.boardManager = new BoardManager(rows, cols,
      new CheckersBoardStyle(), new CheckersEngine(this.firebaseService, gameId));
    this.boardManager.getGameStatus().subscribe(status => {
      if (status != Engine.GAME_IN_PLAY) {
        this.showEndGameDialog(status);
      }
    });
  }

  async showEndGameDialog(status) {
    const alert = await this.alertController.create({
      header: 'Fin de partida',
      message: status == Engine.GAME_WON ? 'Ganó. Siiuuuuuu!' :
        status == Engine.GAME_FINISHED ? 'Juego finalizado' : 'Perdió. F',
      buttons: [
        {
          text: 'Continuar'
        }
      ]
    });
    await alert.present();
    alert.onDidDismiss().then(() => {
      this.router.navigate(['room', this.roomId]);
    });
  }

  spaceClick(space) {
    this.boardManager.onClick(space.row, space.column);
  }

  ngOnDestroy(): void {
    this.boardManager.destroyGame();
  }

}
