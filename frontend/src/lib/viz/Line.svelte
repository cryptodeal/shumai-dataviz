<script lang="ts">
  import * as Pancake from '@sveltejs/pancake';
  import { genColors } from '$lib/utils';
  import ChartWrapper from '$lib/ux/ChartWrapper.svelte';

  export let data: Record<
    string,
    ({ x: number; y: number; label?: string } & Record<string, string | number>)[]
  > = {};
  export let format_x_label: (x: number) => string;
  export let format_y_label: (y: number) => string;

  let closest: { x: number; y: number; label?: string } & Record<string, string | number>,
    x1 = Infinity,
    x2 = -Infinity,
    y1 = Infinity,
    y2 = -Infinity,
    all_data: { x: number; y: number; label?: string }[] = [],
    labels: { label: string; enabled: boolean }[];

  $: labels = Object.keys(data).map((label) => ({
    label,
    enabled: labels.find((x) => x.label === label)?.enabled ?? true
  }));

  $: colors = genColors(Object.keys(data).length);
  $: Object.values(data).forEach((d, i) => {
    if (i === 0) all_data = [];
    d.forEach((v) => {
      all_data.push(v);
      if (v.x < x1) x1 = v.x;
      if (v.x > x2) x2 = v.x;
      if (v.y < y1) y1 = v.y;
      if (v.y > y2) y2 = v.y;
    });
  });
</script>

<ChartWrapper>
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-10 gap-y-1 justify-center items-center">
    <div
      class="order-last lg:order-first lg:col-span-1 grid grid-cols-1 gap-y-1 justify-self-center items-center"
    >
      {#each labels as { label }, i}
        {@const color = colors[i]}
        <div
          class="inline-flex items-center gap-2"
          class:disabled_label={!labels[i].enabled}
          on:click={() => (labels[i].enabled = !labels[i].enabled)}
        >
          <div class="badge badge-sm colored_badge" style:--bg_color={color} />
          <span>{label}</span>
        </div>
      {/each}
    </div>
    <div class="flex flex-col gap-y-5 justify-center lg:col-span-4">
      <div class="text-center">
        <slot name="title" />
      </div>
      <div class="chart">
        <Pancake.Chart {x1} {x2} {y1} y2={y2 === y1 ? y1 + 10 : y2}>
          <Pancake.Grid horizontal count={4} let:value>
            <div class="grid-line horizontal">
              <span>{format_y_label(value)}</span>
            </div>
          </Pancake.Grid>

          <Pancake.Grid vertical count={3} let:value>
            <span class="x-label">{format_x_label(value)}</span>
          </Pancake.Grid>

          {#each Object.values(data) as datum, i}
            {@const color = colors[i]}

            {#if labels[i].enabled && datum.length > 1}
              <Pancake.Svg>
                <Pancake.SvgLine data={datum} let:d>
                  <path class="data" style:--stroke_color={color} {d} />
                </Pancake.SvgLine>
              </Pancake.Svg>
            {/if}
          {/each}

          {#if closest && labels.some((x) => x.label === closest.label && x.enabled)}
            <Pancake.Point x={closest.x} y={closest.y}>
              <span class="annotation-point" />
              <div
                class="annotation bg-secondary navButton {y2 - closest.y >= closest.y - y1
                  ? 'locBottom'
                  : 'locTop'}"
                style="transform: translate(-{100 * ((closest.x - x1) / (x2 - x1))}%,0);"
              >
                <slot name="tooltip" {closest} />
              </div>
            </Pancake.Point>
          {/if}

          <Pancake.Quadtree data={all_data} bind:closest />
        </Pancake.Chart>
      </div>
    </div>
  </div>
</ChartWrapper>

<style>
  .chart {
    height: 400px;
    padding: 1.5em 2.75em 1.5em 6em;
    margin: 0 0 36px 0;
    overflow: hidden;
  }

  .colored_badge {
    background-color: var(--bg_color);
  }

  .grid-line {
    position: relative;
    display: block;
  }
  .grid-line.horizontal {
    width: 100%;
    border-bottom: 1px dashed #ccc;
  }
  .grid-line span {
    position: absolute;
    left: -5em;
    bottom: -11px;
    font-family: sans-serif;
    font-size: 14px;
  }

  .disabled_label {
    @apply opacity-30;
  }

  .x-label {
    position: absolute;
    width: 4em;
    left: -2em;
    bottom: -22px;
    font-family: sans-serif;
    font-size: 14px;
    text-align: center;
  }

  path.data {
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 1px;
    stroke: var(--stroke_color);
    fill: none;
  }
  .annotation {
    position: absolute;
    white-space: nowrap;
    line-height: 1.2;
    padding: 0.2em 0.4em;
    border-radius: 2px;
  }
  .locBottom {
    bottom: 1em;
  }
  .locTop {
    top: 1em;
  }
  .annotation-point {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #ff3e00;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
</style>
