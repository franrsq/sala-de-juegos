import { Tuple } from "./tuple";

export class Move {
    srcRow: number;
    srcCol: number;
    destRow: number;
    destCol: number;
    skipped: Tuple[];
    path: Tuple[];
    jump: boolean;

    constructor(srcRow?: number, srcCol?: number, destRow?: number, destCol?: number, 
        skipped?: Tuple[], path?: Tuple[]) {
        this.srcRow = (srcRow) ? srcRow : 0;
        this.srcCol = (srcCol) ? srcCol : 0;
        this.destRow = (destRow) ? destRow : 0;
        this.destCol = (destCol) ? destCol : 0;
        this.skipped = (skipped) ? skipped : [];
        this.path = (path) ? path : [];
        if (srcRow && destRow) {
            this.jump = Math.abs(srcRow - destRow) == 2;
        }
        else {
            this.jump = false;
        }
        if (srcRow && srcCol && destRow && destCol && !skipped && !path) {
            const srcNode = { x: srcRow, y: srcCol };
            const destNode = { x: destRow, y: destCol };
            this.path.push(destNode);
            this.path.push(srcNode);
        }
    }
}
