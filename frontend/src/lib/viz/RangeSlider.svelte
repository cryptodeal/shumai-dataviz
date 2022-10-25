<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { extents } from '$lib/stores/distributed/stats';
  import { clamp } from 'yootils';

  const start = <Writable<number>>getContext('sliderStart'),
    end = <Writable<number>>getContext('sliderEnd');
  let leftHandle: HTMLDivElement;
  let body: HTMLDivElement;
  let slider: HTMLDivElement;

  const isTouchEvent = (evt: MouseEvent | TouchEvent): evt is TouchEvent =>
    evt.type === 'touchmove';

  function draggable(node: HTMLElement) {
    let x: number;
    let y: number;
    function handleMousedown(event: MouseEvent | TouchEvent) {
      let usedEvent: MouseEvent | Touch = event as MouseEvent;
      if (isTouchEvent(event)) {
        usedEvent = event.touches[0];
      }
      x = usedEvent.clientX;
      y = usedEvent.clientY;
      node.dispatchEvent(
        new CustomEvent('dragstart', {
          detail: { x, y }
        })
      );
      window.addEventListener('mousemove', handleMousemove);
      window.addEventListener('mouseup', handleMouseup);
      window.addEventListener('touchmove', handleMousemove);
      window.addEventListener('touchend', handleMouseup);
    }
    function handleMousemove(event: MouseEvent | TouchEvent) {
      let usedEvent: MouseEvent | Touch = event as MouseEvent;
      if (isTouchEvent(event)) {
        usedEvent = event.changedTouches[0];
      }
      const dx = usedEvent.clientX - x;
      const dy = usedEvent.clientY - y;
      x = usedEvent.clientX;
      y = usedEvent.clientY;
      node.dispatchEvent(
        new CustomEvent('dragmove', {
          detail: { x, y, dx, dy }
        })
      );
    }
    function handleMouseup(event: MouseEvent | TouchEvent) {
      let usedEvent: MouseEvent | Touch = event as MouseEvent;
      if (isTouchEvent(event)) {
        usedEvent = event.touches[0];
      }
      x = usedEvent.clientX;
      y = usedEvent.clientY;
      node.dispatchEvent(
        new CustomEvent('dragend', {
          detail: { x, y }
        })
      );
      window.removeEventListener('mousemove', handleMousemove);
      window.removeEventListener('mouseup', handleMouseup);
      window.removeEventListener('touchmove', handleMousemove);
      window.removeEventListener('touchend', handleMouseup);
    }
    node.addEventListener('mousedown', handleMousedown);
    node.addEventListener('touchstart', handleMousedown);
    return {
      destroy() {
        node.removeEventListener('mousedown', handleMousedown);
        node.removeEventListener('touchstart', handleMousedown);
      }
    };
  }

  function setHandlePosition(which: 'start' | 'end') {
    return function (
      evt: CustomEvent<{
        x: number;
        dx?: number;
        y: number;
        dy?: number;
      }>
    ) {
      const { left, right } = slider.getBoundingClientRect();
      const parentWidth = right - left;
      const p = Math.min(Math.max((evt.detail.x - left) / parentWidth, 0), 1);
      if (which === 'start') {
        start.set(p);
        end.update((end) => Math.max(end, p));
        if ($start === 0 && $end === 1) {
          extents.update((v) => {
            v.isDefault = true;
            return v;
          });
        } else {
          extents.update((v) => {
            v.isDefault = false;
            return v;
          });
        }
      } else {
        start.update((start) => Math.min(p, start));
        end.set(p);
        if ($start === 0 && $end === 1) {
          extents.update((v) => {
            v.isDefault = true;
            return v;
          });
        } else {
          extents.update((v) => {
            v.isDefault = false;
            return v;
          });
        }
      }
    };
  }
  function setHandlesFromBody(
    evt: CustomEvent<{
      x: number;
      dx?: number;
      y: number;
      dy?: number;
    }>
  ) {
    if (evt.detail.dx) {
      const { width } = body.getBoundingClientRect();
      const { left, right } = slider.getBoundingClientRect();
      const parentWidth = right - left;
      const leftHandleLeft = leftHandle.getBoundingClientRect().left;
      const pxStart = clamp(leftHandleLeft + evt.detail.dx - left, 0, parentWidth - width);
      const pxEnd = clamp(pxStart + width, width, parentWidth);
      const pStart = pxStart / parentWidth;
      const pEnd = pxEnd / parentWidth;
      start.set(pStart);
      end.set(pEnd);
    }
  }
</script>

<div class="double-range-container">
  <div class="slider" bind:this={slider}>
    <div
      class="body"
      bind:this={body}
      use:draggable
      on:dragmove|preventDefault|stopPropagation={setHandlesFromBody}
      style="
				left: {100 * $start}%;
				right: {100 * (1 - $end)}%;
			"
    />
    <div
      class="handle"
      bind:this={leftHandle}
      data-which="start"
      use:draggable
      on:dragmove|preventDefault|stopPropagation={setHandlePosition('start')}
      style="
				left: {100 * $start}%
			"
    />
    <div
      class="handle"
      data-which="end"
      use:draggable
      on:dragmove|preventDefault|stopPropagation={setHandlePosition('end')}
      style="
				left: {100 * $end}%
			"
    />
  </div>
</div>

<style>
  .double-range-container {
    width: 100%;
    height: 1.5rem;
    cursor: pointer;
    -webkit-appearance: none;
    --range-shdw: var(--bc);
    background-color: transparent;
  }
  .slider {
    position: relative;
    width: 100%;
    height: 1.5rem;
    background-color: hsla(var(--bc) / 0.1);
  }
  .handle {
    position: absolute;
    top: 50%;
    width: 1.5rem;
    height: 1.5rem;
  }
  .handle:after {
    content: ' ';
    box-sizing: border-box;
    position: absolute;
    border-radius: 50%;
    width: 1.5rem;
    height: 1.5rem;
    transform: translate(-50%, -50%);
  }

  .handle:active:after {
    z-index: 9;
  }

  .body {
    top: 0;
    position: absolute;
    bottom: 0;
    @apply border-r-4 border-l-4 border-secondary bg-primary;
  }
</style>
