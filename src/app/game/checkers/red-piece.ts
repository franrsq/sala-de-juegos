import { Piece } from '../piece';

export class RedPiece extends Piece {
  /**
   * If the pieceType is 0 is a common piece otherwise is a crown
   * 
   * @returns the image appropiate to this piece
   */
  get pieceImg(): string {
    switch (this.pieceType) {
      case 0: case 2: return 'assets/game/red-piece.svg';
    }
    return 'assets/game/red-crown-piece.svg';
  }
}