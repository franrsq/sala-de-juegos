export abstract class Piece {
    pieceType;
    playerNumber;

    constructor(pieceType) {
        this.pieceType = pieceType;
    }

    abstract getPieceImg(): string;
}