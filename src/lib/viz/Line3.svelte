<script lang="ts">
	import * as Pancake from '@sveltejs/pancake';
	export let data: Record<string, { x: number; y: number; label?: string }[]> = {};
	export let format_x_label: (x: any) => string;
	export let colors: string[] = [];
	// $: console.log(data);
	const formatter = Intl.NumberFormat('en', { notation: 'compact' });
	let closest: { x: number; y: number; label?: string };
	let x1 = Infinity;
	let x2 = -Infinity;
	let y1 = 0;
	let y2 = -Infinity;
	let all_data: { x: number; y: number; label?: string }[] = [];
	$: Object.values(data).forEach((d, i) => {
		if (i === 0) all_data = [];
		d.forEach((v) => {
			all_data.push(v);
			if (v.x < x1) x1 = v.x;
			if (v.x > x2) x2 = v.x;
			// if (v.y < y1) y1 = v.y;
			if (v.y > y2) y2 = v.y;
		});
	});
</script>

<div class="chart">
	<Pancake.Chart {x1} {x2} {y1} {y2}>
		<Pancake.Grid horizontal count={4} let:value let:first>
			<div class="grid-line horizontal">
				<span>{formatter.format(value)} bytes</span>
			</div>
		</Pancake.Grid>

		<Pancake.Grid vertical count={3} let:value>
			<span class="x-label">{format_x_label(value)}</span>
		</Pancake.Grid>

		{#each Object.values(data) as datum, i}
			{#if datum.length > 1}
				<Pancake.Svg>
					<Pancake.SvgLine data={datum} let:d>
						<path class="data" style:--stroke_color={colors[i]} {d} />
					</Pancake.SvgLine>
				</Pancake.Svg>
			{/if}
		{/each}

		{#if closest}
			<Pancake.Point x={closest.x} y={closest.y}>
				<span class="annotation-point" />
				<div
					class="annotation bg-secondary navButton {y2 - closest.y >= closest.y - y1
						? 'locBottom'
						: 'locTop'}"
					style="transform: translate(-{100 * ((closest.x - x1) / (x2 - x1))}%,0);"
				>
					<strong class="text-secondary-content">{closest.label}</strong>
					<span class="text-sm text-secondary-content">@ {format_x_label(closest.x)}</span>
					<strong class="text-secondary-content">Bytes used: </strong>
					<span class="text-secondary-content"> {closest.y}</span>
				</div>
			</Pancake.Point>
		{/if}

		<Pancake.Quadtree data={all_data} bind:closest />
	</Pancake.Chart>
</div>

<style>
	.chart {
		height: 400px;
		padding: 1.5em 2.75em 3em 6em;
		margin: 0 0 36px 0;
		overflow: hidden;
	}

	.grid-line {
		position: relative;
		display: block;
	}
	.grid-line.horizontal {
		width: calc(100% + 1em);
		left: -2em;
		border-bottom: 1px dashed #ccc;
	}
	.grid-line span {
		position: absolute;
		left: -4.5em;
		bottom: -11px;
		font-family: sans-serif;
		font-size: 14px;
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
	.annotation strong {
		display: block;
		font-size: 20px;
	}
</style>
