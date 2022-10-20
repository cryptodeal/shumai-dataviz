/* declare worker state management & variables */
self.document = {} as unknown as Document;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any;
export type WorkerMessageData = {
  type: 'query_stats';
};

type BaseData = {
  type: 'start' | 'stop';
};

export type WorkerStartData = BaseData & {
  type: 'start';
  interval?: number;
};

let timer: ReturnType<typeof setInterval>;

ctx.onmessage = function (e: MessageEvent<{ type: string }>) {
  const { data } = e;
  switch (data.type) {
    case 'start':
      timer = setInterval(() => {
        ctx.postMessage({ type: 'query_stats' });
      }, (data as WorkerStartData).interval || 150);
      break;
    case 'stop':
      clearInterval(timer); // resets `timer`, clearing interval
      close(); // shuts down worker
      break;
    default:
      console.error(`Unknown message type: ${data.type}`);
  }
};
