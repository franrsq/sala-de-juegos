import { BehaviorSubject, Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators"
import { FirebaseService } from "src/app/services/firebase.service";
import { BoardManager } from "../board-manager";
import { Engine } from "../engine"
import { Space } from "../space";
import { BlackPiece } from "./black-piece";
import { RedPiece } from "./red-piece";

export class CheckersEngine extends Engine {
  private unsubscribe = new Subject<void>();
  aiType;
  wantsToStart;
  loading = new BehaviorSubject<boolean>(true);
  boardManager: BoardManager;
  selectedSpace: Space = null;
  possiblePlays: Space[] = [];
  turnUid;
  playerIsRed;
  playerUid;
  gameStatus = new BehaviorSubject<number>(Engine.GAME_IN_PLAY);
  firstLoad = true;

  constructor(firebaseService: FirebaseService, aiType = null, wantsToStart = null) {
    super(firebaseService);
    this.aiType = aiType;
    this.wantsToStart = wantsToStart;
    this.playerUid = JSON.parse(localStorage.getItem('user')).uid;
  }

  initGame(boardManager: BoardManager) {
    this.boardManager = boardManager;
    if (this.aiType !== null) {
      this.firebaseService.sendGameCommand('checkers', {
        command: 'play_ai',
        rows: boardManager.board.length,
        columns: boardManager.board[0].length,
        aiType: this.aiType,
        wantsToStart: this.wantsToStart
      });
    } else {
      this.firebaseService.sendGameCommand('checkers', {
        command: 'match',
        rows: boardManager.board.length,
        columns: boardManager.board[0].length,
        wantsToStart: this.wantsToStart
      });
    }
    this.firebaseService.observePlayerStates()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: any) => {
        if (res && res.matching) {
          this.loading.next(true);
        }
        else if (res) {
          this.loading.next(false);
          this.firebaseService.observeGame(res.gamePath, res.game)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((res: any) => {
              if (res) {
                this.loadPlayerInfo(res.p1uid, res.p2uid);
                this.turnUid = res.turn;
                this.loadGameMatrix(res.gameMatrix);
                if (this.turnUid == 0 || this.turnUid == 1 || this.turnUid == 2) {
                  this.requestAiMovement();
                }
                if (!this.firstLoad) {
                  if (res.winner == this.playerUid) {
                    this.gameStatus.next(Engine.GAME_WON);
                  } else if (res.winner != -1) {
                    this.gameStatus.next(Engine.GAME_LOST);
                  }
                  this.playerIsRed = this.playerUid == res.p2uid;
                } else {
                  this.firstLoad = false;
                }
              }
            });
        }
      });
  }

  private requestAiMovement() {
    setTimeout(() => {
      this.firebaseService.sendGameCommand('checkers', {
        command: 'move_ai'
      });
    }, 500);
  }

  private loadPlayerInfo(p1Uid, p2Uid) {
    if (p1Uid == 0 || p1Uid == 1 || p1Uid == 2) {
      this.boardManager.player1 = this.getAIPlayerText(p1Uid);
    } else {
      this.firebaseService.getPlayerData(p1Uid).subscribe((data: any) => {
        let wins = (data.wins || 0);
        let defeats = (data.defeats || 0);
        let wd = (defeats == 0) ? 0 : wins / (wins + defeats);
        this.boardManager.player1 = `${data.nickname}   W/D: ${wd}`;
      });
    }
    if (p2Uid == 0 || p2Uid == 1 || p2Uid == 2) {
      this.boardManager.player2 = this.getAIPlayerText(p2Uid);
    } else {
      this.firebaseService.getPlayerData(p2Uid).subscribe((data: any) => {
        let wins = (data.wins || 0);
        let defeats = (data.defeats || 0);
        let wd = (defeats == 0) ? 0 : wins / (wins + defeats);
        this.boardManager.player2 = `${data.nickname}   W/D: ${wd}`;
      });
    }
  }

  private getAIPlayerText(plUid) {
    switch (plUid) {
      case 0:
        return 'IA fácil   W/D: 0.25';
      case 1:
        return 'IA intermedia   W/D: 0.50';
      case 2:
        return 'IA díficil   W/D: 0.75';
      default:
        return 'Ups';
    }
  }

  private loadGameMatrix(matrix: [][]) {
    let i = 0;
    for (let row in matrix) {
      let j = 0;
      for (let value of matrix[row]) {
        if (value == 0 || value == 1) {
          this.boardManager.board[i][j].piece = new BlackPiece(value);
        } else if (value == 2 || value == 3) {
          this.boardManager.board[i][j].piece = new RedPiece(value);
        } else {
          this.boardManager.board[i][j].piece = null;
        }
        j++;
      }
      i++;
    }
  }

  click(row, column) {
    this.boardManager.removeHighlight();
    // If is the first select, highlight all possible positions or if the user selects
    // another piece that is not highlighted recalculate the highlight
    if (!this.selectedSpace || (!this.possiblePlays.includes(this.boardManager.board[row][column])
      && this.boardManager.board[row][column].piece)) {
      this.calculatePossiblePlays(row, column);
      this.boardManager.removeHighlight();
      if (this.possiblePlays != []) {
        this.boardManager.highlight(this.possiblePlays);
        this.selectedSpace = this.boardManager.board[row][column];
      }
    } else if (this.possiblePlays.includes(this.boardManager.board[row][column])) {
      this.firebaseService.sendGameCommand('checkers', {
        command: "move",
        fromRow: this.selectedSpace.row,
        fromCol: this.selectedSpace.column,
        toRow: row,
        toCol: column
      }).then(res => {
        this.clearSelection();
      });
    } else {
      this.clearSelection();
    }
  }

  clearSelection() {
    this.possiblePlays = [];
    this.selectedSpace = null;
  }

  possibleSpaces(row, column): Space[] {
    const piece = this.boardManager.board[row][column].piece;
    const gameMatrix = this.boardManager.board;
    const ally = (this.playerIsRed) ? 2 : 0;
    const allyCrown = (this.playerIsRed) ? 3 : 1;

    if (piece == null || (piece.pieceType != ally && piece.pieceType != allyCrown)) {
      return [];
    }

    // Si hay alguna pieza que puedo saltar
    if (this.canJump(piece.pieceType)) {
      // si la pieza actual tiene algo que se pueda saltar
      return this.possibleJumpsPiece(row, column);
    } else {
      let spaces: Space[] = [];
      const upRight = (row - 1 >= 0 && column + 1 < gameMatrix[0].length)
        ? gameMatrix[row - 1][column + 1] : null;
      const upLeft = (row - 1 >= 0 && column - 1 >= 0)
        ? gameMatrix[row - 1][column - 1] : null;
      const downRight = (row + 1 < gameMatrix.length && column + 1 < gameMatrix[0].length)
        ? gameMatrix[row + 1][column + 1] : null;
      const downLeft = (row + 1 < gameMatrix.length && column - 1 >= 0)
        ? gameMatrix[row + 1][column - 1] : null;

      // Arriba
      if (piece.pieceType != 0 && (upRight && !upRight.piece)) {
        spaces.push(upRight);
      }
      if (piece.pieceType != 0 && (upLeft && !upLeft.piece)) {
        spaces.push(upLeft);
      }

      // Abajo
      if (piece.pieceType != 2 && (downRight && !downRight.piece)) {
        spaces.push(downRight);
      }
      if (piece.pieceType != 2 && (downLeft && !downLeft.piece)) {
        spaces.push(downLeft);
      }
      return spaces;
    }
  }

  calculatePossiblePlays(row, column) {
    if (this.turnUid == this.playerUid && this.boardManager.board[row][column].piece != null) {
      this.possiblePlays = this.possibleSpaces(row, column);
    }
  }

  canJump(pieceValue: number) {
    const gameMatrix = this.boardManager.board;
    const enemy = (pieceValue == 0) || (pieceValue == 1) ? 2 : 0;
    const enemyCrown = (pieceValue == 0) || (pieceValue == 1) ? 3 : 1;
    const ally = (pieceValue == 0) || (pieceValue == 1) ? 0 : 2;
    const allyCrown = (pieceValue == 0) || (pieceValue == 1) ? 1 : 3;

    for (let i = 0; i < gameMatrix.length; i++) {
      for (let j = 0; j < gameMatrix[0].length; j++) {
        if (gameMatrix[i][j].piece?.pieceType == ally
          || gameMatrix[i][j].piece?.pieceType == allyCrown) {
          const downRight = (i + 1 < gameMatrix.length && j + 1 < gameMatrix[0].length)
            ? gameMatrix[i + 1][j + 1] : null;
          const downLeft = (i + 1 < gameMatrix.length && j - 1 >= 0)
            ? gameMatrix[i + 1][j - 1] : null;
          const downRightSpace = (i + 2 < gameMatrix.length && j + 2 < gameMatrix[0].length)
            ? gameMatrix[i + 2][j + 2] : null;
          const downLeftSpace = (i + 2 < gameMatrix.length && j - 2 >= 0)
            ? gameMatrix[i + 2][j - 2] : null;
          // Downwards
          if ((pieceValue != 2) &&
            (((downRight?.piece?.pieceType == enemy || downRight?.piece?.pieceType == enemyCrown)
              && (downRightSpace && !downRightSpace.piece))
              || ((downLeft?.piece?.pieceType == enemy || downLeft?.piece?.pieceType == enemyCrown)
                && (downLeftSpace && !downLeftSpace.piece)))) {
            return true;
          }

          const upRight = (i - 1 >= 0 && j + 1 < gameMatrix[0].length)
            ? gameMatrix[i - 1][j + 1] : null;
          const upLeft = (i - 1 >= 0 && j - 1 >= 0)
            ? gameMatrix[i - 1][j - 1] : null;
          const upRightSpace = (i - 2 >= 0 && j + 2 < gameMatrix[0].length)
            ? gameMatrix[i - 2][j + 2] : null;
          const upLeftSpace = (i - 2 >= 0 && j - 2 >= 0)
            ? gameMatrix[i - 2][j - 2] : null;
          // Upwards
          if ((pieceValue != 0) &&
            (((upRight?.piece?.pieceType == enemy || upRight?.piece?.pieceType == enemyCrown)
              && (upRightSpace && !upRightSpace.piece))
              || ((upLeft?.piece?.pieceType == enemy || upLeft?.piece?.pieceType == enemyCrown)
                && (upLeftSpace && !upLeftSpace.piece)))) {
            return true;
          }
        }
      }
    }

    return false;
  }

  possibleJumpsPiece(row, column): Space[] {
    const gameMatrix = this.boardManager.board;
    const pieceValue = gameMatrix[row][column].piece.pieceType;
    const enemy = (pieceValue == 0) || (pieceValue == 1) ? 2 : 0;
    const enemyCrown = (pieceValue == 0) || (pieceValue == 1) ? 3 : 1;
    const spaces: Space[] = [];

    const downRight = (row + 1 < gameMatrix.length && column + 1 < gameMatrix[0].length)
      ? gameMatrix[row + 1][column + 1] : null;
    const downLeft = (row + 1 < gameMatrix.length && column - 1 >= 0)
      ? gameMatrix[row + 1][column - 1] : null;
    const downRightSpace = (row + 2 < gameMatrix.length && column + 2 < gameMatrix[0].length)
      ? gameMatrix[row + 2][column + 2] : null;
    const downLeftSpace = (row + 2 < gameMatrix.length && column - 2 >= 0)
      ? gameMatrix[row + 2][column - 2] : null;
    // Downwards
    if ((pieceValue != 2) &&
      (((downRight?.piece?.pieceType == enemy || downRight?.piece?.pieceType == enemyCrown)
        && (downRightSpace && !downRightSpace.piece)))) {
      spaces.push(downRightSpace);
    }
    if ((pieceValue != 2) &&
      (((downLeft?.piece?.pieceType == enemy || downLeft?.piece?.pieceType == enemyCrown)
        && (downLeftSpace && !downLeftSpace.piece)))) {
      spaces.push(downLeftSpace);
    }

    const upRight = (row - 1 >= 0 && column + 1 < gameMatrix[0].length)
      ? gameMatrix[row - 1][column + 1] : null;
    const upLeft = (row - 1 >= 0 && column - 1 >= 0)
      ? gameMatrix[row - 1][column - 1] : null;
    const upRightSpace = (row - 2 >= 0 && column + 2 < gameMatrix[0].length)
      ? gameMatrix[row - 2][column + 2] : null;
    const upLeftSpace = (row - 2 >= 0 && column - 2 >= 0)
      ? gameMatrix[row - 2][column - 2] : null;
    // Upwards
    if ((pieceValue != 0) &&
      (((upRight?.piece?.pieceType == enemy || upRight?.piece?.pieceType == enemyCrown)
        && (upRightSpace && !upRightSpace.piece)))) {
      spaces.push(upRightSpace);
    }
    if ((pieceValue != 0) &&
      (((upLeft?.piece?.pieceType == enemy || upLeft?.piece?.pieceType == enemyCrown)
        && (upLeftSpace && !upLeftSpace.piece)))) {
      spaces.push(upLeftSpace);
    }

    return spaces;
  }

  isLoading(): Observable<boolean> {
    return this.loading.asObservable().pipe(takeUntil(this.unsubscribe));
  }

  getGameStatus(): Observable<number> {
    return this.gameStatus.asObservable().pipe(takeUntil(this.unsubscribe));
  }

  destroyGame() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}