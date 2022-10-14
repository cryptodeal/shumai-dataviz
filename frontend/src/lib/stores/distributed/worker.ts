/* declare worker state management & variables */
self.document = {} as unknown as Document;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any;
export type WorkerMessageData = {
  type: 'query_stats';
};

let timer: ReturnType<typeof setInterval>;

ctx.onmessage = function (e: MessageEvent<{ type: string }>) {
  const { data } = e;
  switch (data.type) {
    case 'start':
      timer = setInterval(() => {
        ctx.postMessage({ type: 'query_stats' });
      }, 100);
      break;
    case 'stop':
      clearInterval(timer); // resets `timer`, clearing interval
      close(); // shuts down worker
      break;
    default:
      console.error(`Unknown message type: ${data.type}`);
  }
};
