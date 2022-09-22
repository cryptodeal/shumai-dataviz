<script lang="ts">
	import { ioStats } from '$lib/stores/distributed/stats';
	import { get_color } from '$lib/utils';
	import Line from '$lib/viz/Line.svelte';

	let parsed_stats: Record<string, { x: number; y: number }[]> = {};
	$: labels = Object.keys(parsed_stats);
	$: $ioStats?.map((stat, i) => {
		if (i === 0) parsed_stats = {};
		const keys = Object.keys(stat.data);
		const key_count = keys.length;
		for (let j = 0; j < key_count; j++) {
			if (!parsed_stats[keys[j]]) {
				parsed_stats[keys[j]] = [{ x: stat.timestamp, y: stat.data[keys[j]].hits }];
			} else {
				parsed_stats[keys[j]].push({ x: stat.timestamp, y: stat.data[keys[j]].hits });
			}
		}
	});

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
		<div class="grid grid-cols-1">
			{#each labels as label, i}
				<div class="inline-flex gap-2">
					<div class="w-4 h-4 chart_key" style:--bg_color={colors[i]} />
					<span>{label}</span>
				</div>
			{/each}
		</div>
		<div class="flex flex-col sm:container">
			<h2>Route (By Model) Statistics</h2>
			<Line data={parsed_stats} {labels} {colors} />
		</div>
	</div>
</div>

<style>
	.chart_key {
		background-color: var(--bg_color);
	}
</style>
