export type BaseData = {
  type: 'start' | 'stop' | 'increment_interval' | 'decrement_interval';
};
export type WorkerMessageData = {
  type: 'query_stats';
};
export type WorkerStartData = BaseData & {
  type: 'start';
  interval?: number;
};
export type WorkerIncrement = BaseData & {
  type: 'increment_interval';
  inc_factor?: number;
};
export type WorkerDecrement = BaseData & {
  type: 'decrement_interval';
  dec_factor?: number;
};
export type WorkerStop = BaseData & {
  type: 'stop';
};
