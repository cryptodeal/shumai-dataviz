/* eslint-disable @typescript-eslint/no-unused-vars */
declare module '@sveltejs/pancake';
declare module 'yootils';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  // interface Locals {}
  // interface PageData {}
  // interface Error {}
  // interface Platform {}
}

declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
    ondragmove: (
      evt: CustomEvent<{
        x: number;
        dx: number;
        y: number;
        dy: number;
      }>
    ) => void;
  }
}
