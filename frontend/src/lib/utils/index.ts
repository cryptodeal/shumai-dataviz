export function get_color(i: number, saturation: number, lightness: number) {
  let hue = 0;
  if (i > 0) {
    const exp = Math.floor(Math.log(i) / Math.log(2));
    const off = (i - Math.pow(2, exp)) * 2 + 1;
    const base = Math.pow(2, exp + 1);
    hue = Math.round(360 * (off / base));
  }
  return `hsl(${hue}, ${100 * saturation}%, ${100 * lightness}%)`;
}

export const genColors = (n: number) => {
  const colors = [];
  for (let i = 0; i < n; i++) {
    colors.push(get_color(i, 0.9, 0.5));
  }
  return colors;
};

export class LoopTimer {
  private timer: null | NodeJS.Timer = null;
  private callback: (...args: any[]) => void;
  private ms: number;
  private started = false;

  constructor(callback: (...args: any[]) => void, ms: number) {
    this.callback = callback;
    this.ms = ms;
    this.start();
  }

  start() {
    if (!this.started) {
      this.timer = setInterval(this.callback, this.ms);
      this.started = true;
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.started = false;
    }
  }

  get getStarted(): boolean {
    return this.started;
  }

  get interval(): number {
    return this.ms;
  }

  setInterval(ms: number) {
    this.ms = ms;
    if (this.started) {
      this.stop();
      this.start();
    }
  }
}
