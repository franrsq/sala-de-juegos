import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { BoardManager } from 'src/app/game/board-manager';
import { CheckersEngine } from 'src/app/game/checkers/checkers-engine';
import { CheckersBoardStyle } from 'src/app/game/checkers/checkers-style';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.page.html',
  styleUrls: ['./game-board.page.scss'],
})
export class GameBoardPage implements OnInit {
  boardManager: BoardManager;

  constructor(
    private loadingController: LoadingController,
    private firebaseService: FirebaseService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    const strAiType = this.route.snapshot.paramMap.get('aiType');
    const aiType = (!strAiType || strAiType == '-1') ? null : parseInt(strAiType);
    const rows = parseInt(this.route.snapshot.paramMap.get('rows'));
    const cols = parseInt(this.route.snapshot.paramMap.get('cols'));
    const wantsToStart = parseInt(this.route.snapshot.paramMap.get('wantsToStart'));

    this.boardManager = new BoardManager(rows, cols,
      new CheckersBoardStyle(), new CheckersEngine(this.firebaseService, aiType, wantsToStart));
    this.loadingDialog();
  }

  async loadingDialog() {
    const loading = await this.loadingController.create({
      message: 'Cargando'
    });
    this.boardManager.isLoading().subscribe((isLoading) => {
      if (isLoading) {
        loading.present();
      } else {
        loading.dismiss();
      }
    });
  }

}
