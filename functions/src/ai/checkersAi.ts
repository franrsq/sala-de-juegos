import { Move } from "./move";
import { Board } from "./board";

export const moveAI = (game: any) => {
    return makeDecision(game);
}

function makeDecision(game: any) {
    let resultValue = Number.NEGATIVE_INFINITY;
    let result = new Move();
    let depth: number;
    const ai = (game.p1uid >= 0 || game.p1uid <= 2) ? game.p1uid : game.p2uid;
    switch (ai) {
        case 0:
            depth = 1;
            break;
        case 1:
            depth = 3;
            break;
        default:
            depth = 5;
    }
    console.log(`AI depth ${depth}`);
    const board = new Board(game.gameMatrix, ai === game.p1uid ? Board.DARK : Board.LIGHT,
        ai === game.p1uid ? Board.DARK : Board.LIGHT);
    const actions = board.getLegalMoves();
    actions.forEach(action => {
        let nextState = board.clone();
        nextState.performMove(action);
        let value = minValue(nextState, depth, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        if (value > resultValue) {
            result = action;
            resultValue = value;
        }
    });
    return result;
}

function minValue(state: Board, depth: number, alpha: number, beta: number) {
    if (depth == 0 || state.isGameOver()) {
        return state.heuristic();
    }
    let value = Number.POSITIVE_INFINITY;
    let legalMoves = state.getLegalMoves();
    for (let index = 0; index < legalMoves.length; index++) {
        let action = legalMoves[index];
        let nextState = state.clone();
        nextState.performMove(action);
        value = Math.min(value, maxValue(nextState, depth - 1, alpha, beta));
        if (value <= alpha)
            return value;
        beta = Math.min(beta, value);
    }
    return value;
}

function maxValue(state: Board, depth: number, alpha: number, beta: number) {
    if (depth == 0 || state.isGameOver()) {
        return state.heuristic();
    }
    let value = Number.NEGATIVE_INFINITY;
    let legalMoves = state.getLegalMoves();
    for (let index = 0; index < legalMoves.length; index++) {
        let action = legalMoves[index];
        let nextState = state.clone();
        nextState.performMove(action);
        value = Math.max(value, minValue(nextState, depth - 1, alpha, beta));
        if (value >= beta)
            return value;
        alpha = Math.max(alpha, value);
    }
    return value;
}
