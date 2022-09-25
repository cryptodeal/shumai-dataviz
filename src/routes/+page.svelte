<script lang="ts">
	import { ioStats, tree_map_data } from '$lib/stores/distributed/stats';
	import * as Pancake from '@sveltejs/pancake';
	import { get_color } from '$lib/utils';
	import { tweened } from 'svelte/motion';
	import * as eases from 'svelte/easing';
	import Line from '$lib/viz/Line.svelte';
	import { fade } from 'svelte/transition';
	import Line2 from '$lib/viz/Line2.svelte';
	import Line3 from '$lib/viz/Line3.svelte';
	import * as d3 from 'd3-hierarchy';
	import Map from '$lib/viz/tree/Map.svelte';
	import type { TreeMapDatum } from '$lib/viz/tree/types';
	import { dataset_dev } from 'svelte/internal';

	// $: console.log(hierarchy);

	let parsed_stats: Record<string, { x: number; y: number; label?: string }[]> = {};
	let req_per_sec: Record<string, { x: number; y: number; label?: string }[]> = {};
	let bytes_data: Record<string, { x: number; y: number; label?: string }[]> = {};

	$: labels = Object.keys(parsed_stats);
	$: bytes_labels = Object.keys(bytes_data);
	// $: console.log($tree_map_data);
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

	const genColors = (n: number) => {
		const colors = [];
		for (let i = 0; i < n; i++) {
			colors.push(get_color(i, 0.9, 0.5));
		}
		return colors;
	};
	$: colors = genColors(labels.length);
	let hierarchy: d3.HierarchyNode<TreeMapDatum>,
		root: { x0: number; x1: number; y0: number; y1: number; children: any[]; parent?: any };
	const treemap = d3.treemap();

	$: hierarchy = d3
		.hierarchy($tree_map_data)
		.sum((d) => d.value)
		.sort((a, b) => b.value - a.value);

	$: root = <{ x0: number; x1: number; y0: number; y1: number; children: any[]; parent?: any }>(
		treemap(hierarchy)
	);

	let selected: {
		x0: number;
		x1: number;
		y0: number;
		y1: number;
		children: any[];
		parent?: any;
	};

	const isMatch = (v, comp) => {
		if (v.data.name === comp.data.name) {
			return comp.data.name;
		} else {
			return false;
		}
	};
	const find_selected = (v) => {
		if (isMatch(v, hierarchy)) return hierarchy;
		if (hierarchy.children) {
			for (let i = 0; i < hierarchy.children.length; i++) {
				if (isMatch(v, hierarchy.children[i])) return hierarchy.children[i];
				const child = hierarchy.children[i];
				if (child.children) {
					for (let j = 0; j < child.children.length; j++) {
						if (isMatch(v, child.children[j])) return child.children[j];
					}
				}
			}
		}
	};

	$: selected = !selected ? root : find_selected(selected);
	const select = (node) => {
		while (node.parent && node.parent !== selected) {
			node = node.parent;
		}

		if (node && node.children) selected = node;
	};

	const breadcrumbs = (node) => {
		const crumbs = [];
		while (node) {
			crumbs.unshift(node.data.name);
			node = node.parent;
		}

		return crumbs.join(' / ');
	};

	const extents = tweened<{ x1: number; x2: number; y1: number; y2: number }>(undefined, {
		duration: 500,
		easing: eases.cubicOut
	});

	const is_visible = (a, b) => {
		while (b) {
			if (a.parent === b) return true;
			b = b.parent;
		}
		return false;
	};

	$: $extents = {
		x1: selected?.x0,
		x2: selected?.x1,
		y1: selected?.y1,
		y2: selected?.y0
	};
</script>

<div class="flex flex-col gap-10">
	<h1 class="text-center">Shumai Distributed Training Analytics</h1>
	<div class="items-center justify-center flex gap-10">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-10">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
				<div class="flex flex-col items-center">
					{#each labels as label, i}
						{@const color = colors[i]}
						<div class="flex items-center gap-2">
							<div class="w-4 h-4 chart_key" style:--bg_color={color} />
							<span>{label}</span>
						</div>
					{/each}
				</div>
				<div class="flex flex-col sm:container">
					<h2>Route (By Model) Statistics</h2>
					<Line data={parsed_stats} {colors} {format_x_label} />
				</div>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
				<div class="flex flex-col items-center">
					{#each labels as label, i}
						{@const color = colors[i]}
						<div class="flex items-center gap-2">
							<div class="w-4 h-4 chart_key" style:--bg_color={color} />
							<span>{label}</span>
						</div>
					{/each}
				</div>
				<div class="flex flex-col sm:container">
					<h2>Avg. Req/Sec By Route (By Model) Statistics</h2>
					<Line2 data={req_per_sec} {colors} {format_x_label} />
				</div>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
				<div class="flex flex-col items-center">
					{#each bytes_labels as label, i}
						{@const color = colors[i]}
						<div class="flex items-center gap-2">
							<div class="w-4 h-4 chart_key" style:--bg_color={color} />
							<span>{label}</span>
						</div>
					{/each}
				</div>
				<div class="flex flex-col sm:container">
					<h2>Bytes Used (By Model)</h2>
					<Line3 data={bytes_data} {colors} {format_x_label} />
				</div>
			</div>
		</div>
	</div>
</div>
<div class="sm:container sm:mx-auto">
	<button
		class="tree_breadcrumbs"
		disabled={!selected?.parent}
		on:click={() => (selected = selected?.parent)}
	>
		{breadcrumbs(selected)}
	</button>

	<div class="chart">
		<Pancake.Chart x1={$extents.x1} x2={$extents.x2} y1={$extents.y1} y2={$extents.y2}>
			<Map {root} let:node>
				{#if is_visible(node, selected)}
					<div
						transition:fade={{ duration: 350 }}
						class="node"
						class:leaf={!node.children}
						on:click={() => select(node)}
					>
						<div class="tree_contents">
							<strong>{node.data.name}</strong>
							<span>Avg Exec. Time: {node.value.toFixed(4)}</span>
						</div>
					</div>
				{/if}
			</Map>
		</Pancake.Chart>
	</div>
</div>

<style>
	.chart_key {
		background-color: var(--bg_color);
	}

	.tree_breadcrumbs {
		width: 100%;
		padding: 0.3rem 0.4rem;
		background-color: transparent;
		font-family: inherit;
		font-size: inherit;
		text-align: left;
		border: none;
		cursor: pointer;
		outline: none;
	}

	.tree_breadcrumbs:disabled {
		cursor: default;
	}

	.chart {
		width: calc(100% + 2px);
		height: 400px;
		padding: 0;
		margin: 0 -1px 36px -1px;
		overflow: hidden;
	}

	.tree_contents {
		width: 100%;
		height: 100%;
		padding: 0.3rem 0.4rem;
		box-sizing: border-box;
		@apply bg-primary bg-opacity-60 border-2 rounded-md text-primary-content border-primary-content;
	}
	.node {
		position: absolute;
		width: 100%;
		background: white;
		height: 100%;
		overflow: hidden;
		pointer-events: all;
		@apply rounded-md border-0;
	}

	.tree_breadcrumbs:disabled {
		cursor: default;
	}

	.node:not(.leaf) {
		cursor: pointer;
	}

	.node:not(.leaf) .tree_contents {
		@apply bg-primary border-2 rounded-md text-primary-content border-primary-content;
	}

	strong,
	span {
		display: block;
		font-size: 12px;
		white-space: nowrap;
		line-height: 1;
	}
</style>
