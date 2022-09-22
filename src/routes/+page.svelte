<script lang="ts">
	import { ioStats } from '$lib/stores/distributed/stats';
	import { get_color } from '$lib/utils';
	import Line from '$lib/viz/Line.svelte';
	import Line2 from '$lib/viz/Line2.svelte';

	let parsed_stats: Record<string, { x: number; y: number; label?: string }[]> = {};
	let req_per_sec: Record<string, { x: number; y: number; label?: string }[]> = {};

	$: labels = Object.keys(parsed_stats);
	$: $ioStats?.map((stat, i) => {
		if (i === 0) parsed_stats = {};
		if (i === 0) req_per_sec = {};
		const keys = Object.keys(stat.data);
		const key_count = keys.length;
		for (let j = 0; j < key_count; j++) {
			if (!parsed_stats[keys[j]]) {
				parsed_stats[keys[j]] = [
					{
						x: stat.timestamp,
						y: stat.data[keys[j]].hits,
						label: keys[j]
					}
				];
			} else {
				parsed_stats[keys[j]].push({
					x: stat.timestamp,
					y: stat.data[keys[j]].hits,
					label: keys[j]
				});
			}
			if (!req_per_sec[keys[j]]) {
				req_per_sec[keys[j]] = [
					{
						x: stat.timestamp,
						y: stat.data[keys[j]].hits / stat.data[keys[j]].seconds,
						label: keys[j]
					}
				];
			} else {
				req_per_sec[keys[j]].push({
					x: stat.timestamp,
					y: stat.data[keys[j]].hits / stat.data[keys[j]].seconds,
					label: keys[j]
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
</script>

<div class="flex flex-col gap-10">
	<h1 class="text-center">Shumai Distributed Training Analytics</h1>
	<div class="items-center justify-center flex gap-10">
		<div class="grid grid-cols-2 gap-2">
			<div class="flex flex-col items-center">
				{#each labels as label, i}
					<div class="flex items-center gap-2">
						<div class="w-4 h-4 chart_key" style:--bg_color={colors[i]} />
						<span>{label}</span>
					</div>
				{/each}
			</div>
			<div class="flex flex-col">
				<h2>Route (By Model) Statistics</h2>
				<Line data={parsed_stats} {colors} {format_x_label} />
			</div>
			<div class="flex flex-col items-center">
				{#each labels as label, i}
					<div class="flex items-center gap-2">
						<div class="w-4 h-4 chart_key" style:--bg_color={colors[i]} />
						<span>{label}</span>
					</div>
				{/each}
			</div>
			<div class="flex flex-col">
				<h2>Avg. Req/Sec By Route (By Model) Statistics</h2>
				<Line2 data={req_per_sec} {colors} {format_x_label} />
			</div>
		</div>
	</div>
</div>

<style>
	.chart_key {
		background-color: var(--bg_color);
	}
</style>
