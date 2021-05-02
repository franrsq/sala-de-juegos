import { Observable } from "rxjs";
import { BoardStyle } from "./board-style";
import { Engine } from "./engine"
import { Space } from "./space";

export class BoardManager {
  board: Space[][];
  engine: Engine;
  player1: string;
  player2: string;
  currentPlayer: string;

  constructor(rows: number, columns: number, boardStyle: BoardStyle, engine: Engine) {
    this.board = boardStyle.generateBoard(rows, columns);
    this.engine = engine;
    engine.initGame(this);
  }

  onClick(row: Number, column: Number) {
    this.engine.click(row, column);
  }

  highlight(spaces: Space[]) {
    if (spaces != null) {
      for (let i = 0; i < spaces.length; i++) {
        spaces[i].highlight = true;
      }
    }
  }

  removeHighlight() {
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[i].length; j++) {
        this.board[i][j].highlight = false;
      }
    }
  }

  getGameStatus(): Observable<number> {
    return this.engine.getGameStatus();
  }

  destroyGame() {
    this.engine.destroyGame();
  }
}