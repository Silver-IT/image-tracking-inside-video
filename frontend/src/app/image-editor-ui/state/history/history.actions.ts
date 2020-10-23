import {HistoryItem} from '../../../image-editor/history/history-item.interface';

export class HistoryChanged {
  public static readonly type = '[History] Changed';
}

export class UpdatePointerById {
  public static readonly type = '[History] Update Pointer By History Item ID';
  constructor(public id: string) {}
}

export class AddHistoryItem {
  public static readonly type = '[History] Add Item';
  constructor(public item: HistoryItem) {}
}

export class ReplaceCurrentItem {
  public static readonly type = '[History] Replace Current Item';
  constructor(public item: HistoryItem) {}
}

export class ResetHistory {
  public static readonly type = '[History] Reset';
}
