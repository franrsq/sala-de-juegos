import { BoardStyle } from "../board-style";

import { Space } from '../space';

export class CheckersBoardStyle extends BoardStyle {
  generateBoard(rows: number, columns: number): Space[][] {
    let board = [];

    for (let i: number = 0; i < rows; i++) {
      board[i] = [];
      for (let j: number = 0; j < columns; j++) {
        if ((i % 2 == 0 && j % 2 == 0) || (i % 2 == 1 && j % 2 == 1)) {
          board[i][j] = new Space(i, j, "assets/game/blue-space.svg", "assets/game/highlight-space.svg");
        } else if ((i % 2 == 1 && j % 2 == 0) || (i % 2 == 0 && j % 2 == 1)) {
          board[i][j] = new Space(i, j, "assets/game/white-space.svg", "assets/game/highlight-space.svg");
        }
      }
    }

    return board;
  }
}