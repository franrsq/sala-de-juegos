import { Space } from './space';

export abstract class BoardStyle {
  abstract generateBoard(rows: number, columns: number): Space[][];
}