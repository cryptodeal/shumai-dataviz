<script lang="ts">
  import { ioStats, tree_map_data } from '$lib/stores/distributed/stats';
  import Line from '$lib/viz/Line.svelte';
  import TreeMap from '$lib/viz/tree/TreeMap.svelte';
  import type { Timer, TreeMapDatum } from '$lib/viz/tree/types';

  let parsed_stats: Record<string, { x: number; y: number; label?: string }[]> = {};
  let req_per_sec: Record<string, { x: number; y: number; label?: string }[]> = {};
  let bytes_data: Record<string, { x: number; y: number; label?: string }[]> = {};

  let clear: Timer,
    used_tree_data: TreeMapDatum,
    has_tree_data = false,
    // TODO: allow changing interval w range slider input
    interval = 5000;

  $: if (!has_tree_data && $tree_map_data.children.length) {
    has_tree_data = true;
    used_tree_data = $tree_map_data;
  }

  const updateTreeData = () => (used_tree_data = $tree_map_data);
  $: {
    clearInterval(clear);
    clear = setInterval(updateTreeData, interval);
  }

  $: $ioStats?.map((stat, i) => {
    if (i === 0) parsed_stats = {};
    if (i === 0) req_per_sec = {};
    if (i === 0) bytes_data = {};

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
        const bytes = Number(BigInt(stat.bytes_used[bytes_keys[j]]));
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
  });

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

<div class="flex flex-col justify-center gap-y-10 md:gap-y-32">
  <h1 class="text-center">Shumai Distributed Training Analytics</h1>
  <div class="items-center md:mx-10 justify-center grid grid-cols-1 xl:grid-cols-2 gap-10">
    <Line {format_x_label} format_y_label={format_y_label_hits} data={parsed_stats}>
      <h2 slot="title">Route Statistics</h2>
      <svelte:fragment slot="tooltip" let:closest>
        <strong class="text-secondary-content">{closest.label}</strong>
        <span class="text-sm text-secondary-content">@ {format_x_label(closest.x)}</span>
        <strong class="text-secondary-content">Hits:</strong>
        <span class="text-secondary-content">{closest.y}</span>
      </svelte:fragment>
    </Line>

    <Line {format_x_label} format_y_label={format_y_label_avg_req_time} data={req_per_sec}>
      <h2 slot="title">Avg. Req/Sec By Route</h2>
      <svelte:fragment slot="tooltip" let:closest>
        <strong class="text-secondary-content">{closest.label}</strong>
        <span class="text-sm text-secondary-content">@ {format_x_label(closest.x)}</span>
        <strong class="text-secondary-content">Req/Sec:</strong>
        <span class="text-secondary-content">{closest.y}</span>
      </svelte:fragment>
    </Line>

    <Line {format_x_label} format_y_label={format_y_label_bytes} data={bytes_data}>
      <h2 slot="title">Memory Usage (Bytes)</h2>
      <svelte:fragment slot="tooltip" let:closest>
        <strong class="text-secondary-content">{closest.label}</strong>
        <span class="text-sm text-secondary-content">@ {format_x_label(closest.x)}</span>
        <strong class="text-secondary-content">Mem Usg:</strong>
        <span class="text-secondary-content">{closest.y} bytes</span>
      </svelte:fragment>
    </Line>
  </div>
  {#if used_tree_data}
    <TreeMap data={used_tree_data}>
      <h2 slot="title">Tensor Ops TreeMap</h2>
    </TreeMap>
  {/if}
</div>
