import type { WorkerStartData, WorkerIncrement, WorkerDecrement, WorkerStop } from './types';
import { LoopTimer } from '$lib/utils';

/* declare worker state management & variables */
self.document = {} as unknown as Document;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any,
  factor = 1.5;

let timer: LoopTimer,
  min_interval = 100;

ctx.onmessage = function (
  e: MessageEvent<WorkerStartData | WorkerDecrement | WorkerIncrement | WorkerStop>
) {
  const { data } = e;
  switch (data.type) {
    case 'start':
      if (data.interval) min_interval = data.interval;
      timer = new LoopTimer(() => {
        ctx.postMessage({ type: 'query_stats' });
      }, min_interval);
      break;
    case 'increment_interval':
      timer.setInterval(timer.interval * (data.inc_factor || factor));
      break;
    case 'decrement_interval': {
      const newInterval = timer.interval / (data.dec_factor || factor);
      if (newInterval >= min_interval && newInterval !== timer.interval)
        timer.setInterval(newInterval);
      break;
    }
    case 'stop':
      timer.stop(); // shuts down `LoopTimer` (interally calls `clearInterval`)
      close(); // shuts down worker
      break;
    default:
      throw new Error(`Unknown message type; received: ${data}`);
  }
};
