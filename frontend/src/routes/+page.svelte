<script lang="ts">
  import { ioStats, tree_map_data, extents } from '$lib/stores/distributed/stats';
  import Line from '$lib/viz/Line.svelte';
  import TreeMap from '$lib/viz/tree/TreeMap.svelte';
  import type { Timer, TreeMapDatum } from '$lib/viz/tree/types';
  import { getContext, setContext } from 'svelte';
  import { writable, type Writable } from 'svelte/store';

  let parsed_stats: Record<string, { x: number; y: number; label?: string }[]> = {};
  let req_per_sec: Record<string, { x: number; y: number; label?: string }[]> = {};
  let bytes_data: Record<string, { x: number; y: number; label?: string }[]> = {};

  let resetScale1: () => void, resetScale2: () => void, resetScale3: () => void;

  let clear: Timer,
    used_tree_data: TreeMapDatum,
    has_tree_data = false,
    // TODO: allow changing interval w range slider input
    interval = 5000;

  const largeCharts = <Writable<boolean>>getContext('largeCharts'),
    isHitsVisible = <Writable<boolean>>getContext('isHitsVisible'),
    isAvgReqTimeVisible = <Writable<boolean>>getContext('isAvgReqTimeVisible'),
    isMemVisible = <Writable<boolean>>getContext('isMemVisible'),
    sliderStart = writable<number>(0),
    sliderEnd = writable<number>(1);

  setContext('sliderStart', sliderStart);
  setContext('sliderEnd', sliderEnd);
  $: x_range = $extents.bounds[1] - $extents.bounds[0];
  $: used_data_start = $sliderStart * x_range + $extents.bounds[0];

  $: used_data_end = $extents.bounds[1] - (1 - $sliderEnd) * x_range;

  // $: console.log('used_data_start:', used_data_start, ', used_data_end:', used_data_end);

  $: if (!has_tree_data && $tree_map_data.children.length) {
    has_tree_data = true;
    used_tree_data = $tree_map_data;
  }

  const updateTreeData = () => (used_tree_data = $tree_map_data);
  $: {
    clearInterval(clear);
    clear = setInterval(updateTreeData, interval);
  }

  $: for (let i = 0; i < $ioStats.length; i++) {
    if (i === 0) {
      parsed_stats = {};
      req_per_sec = {};
      bytes_data = {};
      if ($sliderStart !== 0 || $sliderEnd !== 1) {
        // TODO: a bit hacky
        resetScale1();
        resetScale2();
        resetScale3();
      }
    }
    const stat = $ioStats[i];
    if (stat.timestamp < used_data_start) continue;
    if (stat.timestamp > used_data_end) break;

    const route_keys = Object.keys(stat.route_stats);
    const key_count = route_keys.length;

    for (let j = 0; j < key_count; j++) {
      if (!parsed_stats[route_keys[j]]) parsed_stats[route_keys[j]] = [];
      parsed_stats[route_keys[j]].push({
        x: stat.timestamp,
        y: stat.route_stats[route_keys[j]].hits,
        label: route_keys[j]
      });

      if (!req_per_sec[route_keys[j]]) req_per_sec[route_keys[j]] = [];

      req_per_sec[route_keys[j]].push({
        x: stat.timestamp,
        y: stat.route_stats[route_keys[j]].hits / stat.route_stats[route_keys[j]].seconds,
        label: route_keys[j]
      });
    }
    const bytes_keys = Object.keys(stat.bytes_used);
    const byte_key_count = bytes_keys.length;
    for (let j = 0; j < byte_key_count; j++) {
      if (!bytes_data[bytes_keys[j]]) {
        const bytes = stat.bytes_used[bytes_keys[j]]
          ? Number(BigInt(stat.bytes_used[bytes_keys[j]]))
          : undefined;
        if (bytes)
          bytes_data[bytes_keys[j]] = [
            {
              x: stat.timestamp,
              y: Number(stat.bytes_used[bytes_keys[j]]),
              label: bytes_keys[j]
            }
          ];
      } else {
        const bytes = Number(BigInt(stat.bytes_used[bytes_keys[j]]));
        if (bytes)
          bytes_data[bytes_keys[j]].push({
            x: stat.timestamp,
            y: Number(stat.bytes_used[bytes_keys[j]]),
            label: bytes_keys[j]
          });
      }
    }
  }

  const format_x_label = (x: number) => {
    const date = new Date(x);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${hours === 0 ? 12 : hours}:${
      minutes.toString().length > 1 ? minutes : `0${minutes}`
    }:${seconds.toString().length > 1 ? seconds : `0${seconds}`}`;
  };

  const formatter = Intl.NumberFormat('en', { notation: 'compact' });

  const format_y_label_hits = (y: number) => {
    return `${formatter.format(y)} hits`;
  };

  const format_y_label_avg_req_time = (y: number) => {
    return `${formatter.format(y)} req/s`;
  };

  const format_y_label_bytes = (y: number) => {
    return `${formatter.format(y)} bytes`;
  };
</script>

<div class="flex flex-col justify-center gap-y-0 md:gap-y-2">
  <div
    class="items-center md:mx-0 justify-center grid grid-cols-1 gap-5"
    class:xlCharts={$largeCharts}
    class:charts={!$largeCharts}
  >

    <Line
      {format_x_label}
      format_y_label={format_y_label_avg_req_time}
      bind:resetScale={resetScale2}
      data={req_per_sec}
      hidden={!$isAvgReqTimeVisible}
    >
      <h5 slot="title">Avg. Req/Sec By Route</h5>
      <svelte:fragment slot="tooltip" let:closest>
        <strong class="text-secondary-content">{closest.label}</strong>
        <span class="text-sm text-secondary-content">@ {format_x_label(closest.x)}</span>
        <strong class="text-secondary-content">Req/Sec:</strong>
        <span class="text-secondary-content">{closest.y}</span>
      </svelte:fragment>
    </Line>

    <Line
      {format_x_label}
      format_y_label={format_y_label_bytes}
      bind:resetScale={resetScale3}
      data={bytes_data}
      hidden={!$isMemVisible}
    >
      <h5 slot="title">Memory Usage (Bytes)</h5>
      <svelte:fragment slot="tooltip" let:closest>
        <strong class="text-secondary-content">{closest.label}</strong>
        <span class="text-sm text-secondary-content">@ {format_x_label(closest.x)}</span>
        <strong class="text-secondary-content">Mem Usg:</strong>
        <span class="text-secondary-content">{closest.y} bytes</span>
      </svelte:fragment>
    </Line>

    <Line
      {format_x_label}
      format_y_label={format_y_label_hits}
      bind:resetScale={resetScale1}
      data={parsed_stats}
      hidden={!$isHitsVisible}
    >
      <h5 slot="title">Route Statistics</h5>
      <svelte:fragment slot="tooltip" let:closest>
        <strong class="text-secondary-content">{closest.label}</strong>
        <span class="text-sm text-secondary-content">@ {format_x_label(closest.x)}</span>
        <strong class="text-secondary-content">Hits:</strong>
        <span class="text-secondary-content">{closest.y}</span>
      </svelte:fragment>
    </Line>

  {#if used_tree_data}
    <TreeMap data={used_tree_data}>
      <h5 slot="title">Tensor Ops TreeMap</h5>
    </TreeMap>
  {/if}

  </div>

  <!-- TODO: snapshot store works, but need to implement UI && test
    <select bind:value={selected}>
      {#each [...$snapshots.keys()] as key, i}
        <option value={key}>
          {format_x_label(key)}
        </option>
      {/each}
    </select>
  -->
</div>

<style>
  .charts {
    @apply grid-cols-2;
  }

  .xlCharts {
    @apply grid-cols-1;
  }
</style>
