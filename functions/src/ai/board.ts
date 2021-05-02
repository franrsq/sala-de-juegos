import { Move } from "./move";
import { Tuple } from "./tuple";

export class Board {
    static readonly DARK = 0;
    static readonly DARK_KING = 1;
    static readonly LIGHT = 2;
    static readonly LIGHT_KING = 3;
    countLightKings = 0;
    countDarkKings = 0;

    //Config for some new game
    countLightPieces = 0;
    countDarkPieces = 0;
    matrix: number[][];

    playerColor: any;
    aiColor: any;

    constructor(gameMatrix: number[][], playerColor: number, aiColor: number) {
        this.countLightKings = 0;
        this.countDarkKings = 0;
        //Config for some new game
        this.countLightPieces = 0;
        this.countDarkPieces = 0;
        this.playerColor = playerColor;
        this.matrix = gameMatrix;
        this.aiColor = aiColor;
        for (let i = 0; i < gameMatrix.length; i++) {
            for (let j = 0; j < gameMatrix[0].length; j++) {
                switch (gameMatrix[i][j]) {
                    case Board.DARK:
                        this.countDarkPieces++;
                        break;
                    case Board.DARK_KING:
                        this.countDarkPieces++;
                        this.countDarkKings++;
                        break;
                    case Board.LIGHT:
                        this.countLightPieces++;
                        break;
                    case Board.LIGHT_KING:
                        this.countLightPieces++;
                        this.countLightKings++;
                        break;
                }
            }
        }
    }

    // Enumerate all possible options and get the legal moves for a given player.
    getLegalMoves() {
        let curPlayer = this.playerColor;
        let legalMoves: Move[] = [];
        let playerSquares: Tuple[] = [];
        let king = (curPlayer == Board.DARK) ? Board.DARK_KING : Board.LIGHT_KING;
        //Enumerate all jumps
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[0].length; j++) {
                if (this.matrix[i][j] == curPlayer || this.matrix[i][j] == king) {
                    let player = this.matrix[i][j];
                    playerSquares.push({ x: i, y: j });
                    if (this.isValidJump(player, i, j, i + 1, j + 1, i + 2, j + 2)) {
                        let validJumps = this.getJumpLeaves(player, i, j, i + 1, j + 1, i + 2, j + 2);
                        validJumps.forEach(jump => {
                            legalMoves.push(jump);
                        });
                    }
                    if (this.isValidJump(player, i, j, i - 1, j - 1, i - 2, j - 2)) {
                        let validJumps = this.getJumpLeaves(player, i, j, i - 1, j - 1, i - 2, j - 2);
                        validJumps.forEach(jump => {
                            legalMoves.push(jump);
                        });
                    }
                    if (this.isValidJump(player, i, j, i + 1, j - 1, i + 2, j - 2)) {
                        let validJumps = this.getJumpLeaves(player, i, j, i + 1, j - 1, i + 2, j - 2);
                        validJumps.forEach(jump => {
                            legalMoves.push(jump);
                        });
                    }
                    if (this.isValidJump(player, i, j, i - 1, j + 1, i - 2, j + 2)) {
                        let validJumps = this.getJumpLeaves(player, i, j, i - 1, j + 1, i - 2, j + 2);
                        validJumps.forEach(jump => {
                            legalMoves.push(jump);
                        });
                    }
                }
            }
        }
        //Try normal moves if no jumps were found
        if (legalMoves.length == 0) {
            playerSquares.forEach(square => {
                let i = Math.floor(square.x);
                let j = Math.floor(square.y);
                let player = this.matrix[i][j];
                if (this.isValidMove(player, i, j, i + 1, j + 1))
                    legalMoves.push(new Move(i, j, i + 1, j + 1));
                if (this.isValidMove(player, i, j, i - 1, j - 1))
                    legalMoves.push(new Move(i, j, i - 1, j - 1));
                if (this.isValidMove(player, i, j, i + 1, j - 1))
                    legalMoves.push(new Move(i, j, i + 1, j - 1));
                if (this.isValidMove(player, i, j, i - 1, j + 1))
                    legalMoves.push(new Move(i, j, i - 1, j + 1));
            });
        }
        return legalMoves;
    }

    isLeafNode(neighbors: Move[], visited: Set<string>) {
        for (let index = 0; index < neighbors.length; index++) {
            const m = neighbors[index];
            let to = m.destRow.toString() + "#" + m.destCol.toString();
            if (!visited.has(to))
                return false;
        }
        return true;
    }

    getJumpPath(parent: Map<string, string>, src: string, dest: string) {
        let path = [];
        let key: any = dest;
        while (parent.has(key)) {
            let x = parseInt(key.charAt(0), 36);
            let y = parseInt(key.charAt(2), 36);
            let square = { x: x, y: y };
            path.push(square);
            key = parent.get(key);
        }
        let srcX = parseInt(src.charAt(0), 36);
        let srcY = parseInt(src.charAt(2), 36);
        let srcSquare = { x: srcX, y: srcY };
        path.push(srcSquare);
        return path;
    }

    //Returns the list of nodes that will be skipped after a jump move.
    //These squares will be set to empty subsequently.
    getSkippedNodes(parent: Map<string, string>, src: string, dest: string) {
        let skipped = [];
        let key: any = dest;
        while (parent.has(key)) {
            let px = parseInt(key.charAt(0), 36);
            let py = parseInt(key.charAt(2), 36);
            key = parent.get(key);
            let cx = parseInt(key.charAt(0), 36);
            let cy = parseInt(key.charAt(2), 36);
            let squareX = Math.floor((px + cx) / 2);
            let squareY = Math.floor((py + cy) / 2);
            let square = { x: squareX, y: squareY };
            skipped.push(square);
        }
        return skipped;
    }

    getJumpLeaves(player: number, srcRow: number, srcCol: number, skipRow: number,
        skipCol: number, curRow: number, curCol: number) {
        let stack = [];
        let validMoves: Move[] = [];
        let visited = new Set<string>();
        let parent = new Map<string, string>();
        let srcNode = srcRow.toString() + "#" + srcCol.toString();
        let dstNode = curRow.toString() + "#" + curCol.toString();
        parent.set(dstNode, srcNode);
        stack.push(new Move(srcRow, srcCol, curRow, curCol));
        visited.add(srcNode);
        while (stack.length != 0) {
            let top = stack.pop();
            if (!top) {
                break;
            }
            let neighbors = this.getLegalJumps(player, top.destRow, top.destCol);
            let from = top.destRow.toString() + "#" + top.destCol.toString();
            visited.add(top.srcRow.toString() + "#" + top.srcCol.toString());
            visited.add(top.destRow.toString() + "#" + top.destCol.toString());
            if (neighbors.length == 0 || this.isLeafNode(neighbors, visited)) {
                let path = this.getJumpPath(parent, srcNode, from);
                let skipped = this.getSkippedNodes(parent, srcNode, from);
                let newValidMove = new Move(srcRow, srcCol, top.destRow, top.destCol, skipped, path);
                validMoves.push(newValidMove);
                visited.delete(from);
            }
            neighbors.forEach(m => {
                let to = m.destRow.toString() + "#" + m.destCol.toString();
                if (!visited.has(to)) {
                    stack.push(m);
                    parent.set(to, from);
                }
            });
        }
        if (validMoves.length == 0) {
            validMoves.push(new Move(srcRow, srcCol, curRow, curCol));
        }
        return validMoves;
    }

    getLegalJumps(player: number, i: number, j: number) {
        let current = this.matrix[i][j];
        this.matrix[i][j] = player;
        let legalMoves = [];
        if (this.isValidJump(player, i, j, i - 1, j - 1, i - 2, j - 2))
            legalMoves.push(new Move(i, j, i - 2, j - 2));
        if (this.isValidJump(player, i, j, i + 1, j + 1, i + 2, j + 2))
            legalMoves.push(new Move(i, j, i + 2, j + 2));
        if (this.isValidJump(player, i, j, i + 1, j - 1, i + 2, j - 2))
            legalMoves.push(new Move(i, j, i + 2, j - 2));
        if (this.isValidJump(player, i, j, i - 1, j + 1, i - 2, j + 2))
            legalMoves.push(new Move(i, j, i - 2, j + 2));
        this.matrix[i][j] = current;
        return legalMoves;
    }

    //Check if (x,y) is outside the checkerboard
    isOutOfBounds(x: number, y: number) {
        if (x < 0 || y < 0 || x >= this.matrix.length || y >= this.matrix[0].length) {
            return true;
        }
        return false;
    }

    isFilled(x: number, y: number) {
        return this.matrix[x][y] != -1;
    }

    // Check if move from (srcRow,srcCol) -> (destRow, destCol) is legal
    isValidMove(player: number, srcRow: number, srcCol: number, destRow: number, destCol: number) {
        if (this.isOutOfBounds(destRow, destCol))
            return false;
        if (this.isFilled(destRow, destCol))
            return false;
        if (player == Board.DARK || player == Board.DARK_KING) {
            if (this.matrix[srcRow][srcCol] == Board.DARK && srcRow > destRow)
                return false; //DARK PAWN cannot move up!
            else
                return true; //DARK KING can move in any direction.
        }
        if (player == Board.LIGHT || player == Board.LIGHT_KING) {
            if (this.matrix[srcRow][srcCol] == Board.LIGHT && srcRow < destRow)
                return false; //LIGHT PAWN cannot move down!
            else
                return true; //LIGHT KING can move in any direction.
        }
        return false;
    }

    // Check if jump from (srcRow,srcCol) -> (skipRow, skipCol) ->(destRow, destCol) is legal
    isValidJump(player: number, srcRow: number, srcCol: number, skipRow: number,
        skipCol: number, destRow: number, destCol: number) {
        if (this.isOutOfBounds(destRow, destCol))
            return false;
        if (this.isFilled(destRow, destCol))
            return false;
        if (!this.isFilled(skipRow, skipCol))
            return false;
        if (player == Board.DARK || player == Board.DARK_KING) {
            if (this.matrix[srcRow][srcCol] == Board.DARK && srcRow > destRow)
                return false; //DARK PAWN cannot move up!
            if (this.matrix[skipRow][skipCol] == Board.DARK || this.matrix[skipRow][skipCol] == Board.DARK_KING)
                return false; //DARK pieces cannot skip DARK pieces!
            else
                return true; //DARK pieces can skip LIGHT pieces.
        }
        if (player == Board.LIGHT || player == Board.LIGHT_KING) {
            if (this.matrix[srcRow][srcCol] == Board.LIGHT && srcRow < destRow)
                return false; //LIGHT PAWN cannot move down!
            if (this.matrix[skipRow][skipCol] == Board.LIGHT || this.matrix[skipRow][skipCol] == Board.LIGHT_KING)
                return false; //LIGHT pieces cannot skip LIGHT pieces!
            else
                return true; //DARK pieces can skip LIGHT pieces.
        }
        return false;
    }

    performMove(move: Move) {
        let srcRow, srcCol, destRow, destCol;
        srcRow = move.srcRow;
        srcCol = move.srcCol;
        destRow = move.destRow;
        destCol = move.destCol;
        let current = this.matrix[srcRow][srcCol];
        //Promote pawn to king
        if (destRow == this.matrix.length - 1 && current == Board.DARK) {
            current = Board.DARK_KING;
            this.countDarkKings++;
        }
        else if (destRow == 0 && current == Board.LIGHT) {
            current = Board.LIGHT_KING;
            this.countLightKings++;
        }
        this.matrix[destRow][destCol] = current;
        this.matrix[srcRow][srcCol] = -1;
        //Remove skipped moves for jumps
        if (!(move.skipped.length == 0)) {
            move.skipped.forEach((square) => {
                let row = square.x;
                let col = square.y;
                let removedPiece = this.matrix[row][col];
                if (removedPiece == Board.DARK || removedPiece == Board.DARK_KING) {
                    if (removedPiece == Board.DARK_KING) {
                        this.countDarkKings--;
                    }
                    this.countDarkPieces--;
                }
                if (removedPiece == Board.LIGHT || removedPiece == Board.LIGHT_KING) {
                    if (removedPiece == Board.LIGHT_KING) {
                        this.countLightKings--;
                    }
                    this.countLightPieces--;
                }
                this.matrix[row][col] = -1;
            });
        }
        //Alter color after each move
        if (this.playerColor == Board.DARK) {
            this.playerColor = Board.LIGHT;
        }
        else {
            this.playerColor = Board.DARK;
        }
        return;
    }

    heuristic() {
        if (this.aiColor == Board.DARK) {
            return -this.countLightPieces + this.countDarkPieces
                - (this.countLightKings * 0.5 - this.countDarkKings * 0.5);
        }
        return -this.countDarkPieces + this.countLightPieces
            - (this.countDarkKings * 0.5 - this.countLightKings * 0.5);
    }

    getWinner() {
        if (this.countDarkPieces <= 0) {
            return Board.LIGHT;
        }
        else if (this.countLightPieces <= 0) {
            return Board.DARK;
        }
        else if (this.getLegalMoves().length == 0) {
            return -2;
        }
        return -1;
    }

    isGameOver() {
        return this.countLightPieces == 0 || this.countDarkPieces == 0;
    }

    clone() {
        let matrix = [];
        let player = this.playerColor;
        let ai = this.aiColor;
        for (let i = 0; i < this.matrix.length; i++) {
            let r = [];
            for (let j = 0; j < this.matrix[0].length; j++) {
                r[j] = this.matrix[i][j];
            }
            matrix[i] = r;
        }
        let clone = new Board(matrix, player, ai);
        return clone;
    }
}
