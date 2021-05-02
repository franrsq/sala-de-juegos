import { Observable } from "rxjs";
import { FirebaseService } from "../services/firebase.service";
import { BoardManager } from "./board-manager";

export abstract class Engine {

  static readonly GAME_IN_PLAY = 0;
  static readonly GAME_LOST = 1;
  static readonly GAME_WON = 2;
  static readonly GAME_FINISHED = 3;

  firebaseService: FirebaseService;
  aiType: number;
  wantsToStart: boolean;

  constructor(firebaseService: FirebaseService, aiType = null, wantsToStart = null) {
    this.firebaseService = firebaseService;
    this.aiType = aiType;
    this.wantsToStart = wantsToStart;
  }

  abstract initGame(boardManager: BoardManager);

  abstract click(row: Number, column: Number);

  abstract getGameStatus(): Observable<number>;

  abstract destroyGame();
}