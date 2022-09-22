<script lang="ts">
	import * as Pancake from '@sveltejs/pancake';
	import * as yootils from 'yootils';
	export let data: any;
	export let colors: string[];
	export let values: string[];
	export let labels: string[];
	let closest: { x: number; y: number };

	let x1 = Infinity;
	let x2 = -Infinity;
	data.forEach((d: { x: number; y: number }) => {
		if (d.x < x1) x1 = d.x;
		if (d.x > x2) x2 = d.x;
	});

	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'June',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];

	const format_Date = (x) => {
		const d = new Date(x);
		const month = months[d.getMonth()];
		return `${month} ${d.getDate()}, ${d.getFullYear()}`;
	};

	const stacks: { key: string; values: { key: string }[] }[] = Pancake.stacks(data, values, 'date');
	//$: console.log(stacks)
	$: quadData = stacks.map((stack) => {
		return stack.values.map((d) => {
			return {
				x: d.i,
				y: d.end,
				value: d.value
			};
		});
	});
	$: quadPoints = quadData.flat();

	const max = stacks.reduce((max, stack) => Math.max(max, ...stack.values.map((v) => v.end)), 0);

	const area = (values) =>
		values
			.map((d: { x: number; y: number }) => ({ x: d.x, y: d.x }))
			.concat(values.map((d: { x: number; y: number }) => ({ x: d.x, y: 0 })).reverse());
</script>

<div class="chart">
	<Pancake.Chart {x1} {x2} y1={0} y2={max}>
		<Pancake.Grid horizontal count={4} let:value let:first>
			<div class="grid-line horizontal"><!--<span class:first>{format_y(value)}</span>--></div>
		</Pancake.Grid>

		<Pancake.Grid vertical count={3} let:value>
			<span class="x-label" />
		</Pancake.Grid>

		<Pancake.Svg>
			{#each stacks as s, i}
				<Pancake.SvgPolygon data={area(s.values)} let:d>
					<path class="data" style="fill: url('#myGradient-{values[i]}')" {d} />
				</Pancake.SvgPolygon>
			{/each}
		</Pancake.Svg>

		{#if closest}
			{#each quadData as array, i}
				<Pancake.Point
					x={array[array.findIndex((p) => p.x == closest.x)].x}
					y={array[array.findIndex((p) => p.x == closest.x)].y}
				>
					<span class="annotation-point" />

					{#if i == 0}
						<span class="annotation-label">
							<div
								class="annotation navButton {max - closest.y >= closest.y - 0
									? 'locBottom'
									: 'locTop'}"
								style="transform: translate(-{100 * ((closest.x - x1) / (x2 - x1))}%,0);"
							>
								<strong>{format_Date(closest.x)}</strong>
								{#if labels.length !== quadData.length}
									<!--<span>
										{labels[0]}: {formatLabel(
											quadData[0][quadData[0].findIndex((p) => p.x == closest.x)].value
										)}
									</span>
									<span>
										{labels[1]}: {formatLabel(
											100 - quadData[0][quadData[0].findIndex((p) => p.x == closest.x)].value
										)}
									</span>
                  -->
								{:else}
									<!--
									{#each labels as label, j}
										<span>
											{label}: {formatLabel(
												quadData[j][quadData[j].findIndex((p) => p.x == closest.x)].value
											)}
										</span>
									{/each}
                  -->
								{/if}
							</div>
						</span>
					{/if}
				</Pancake.Point>
			{/each}
		{/if}
		<Pancake.Quadtree data={quadPoints} bind:closest />
	</Pancake.Chart>
</div>

<style>
	.chart {
		height: 270px;
		padding: 0.5em 1.75em 3em 4em;
		margin: 0 0 36px 0;
		overflow: hidden;
	}

	.grid-line {
		position: relative;
		display: block;
	}

	span.first {
		display: none;
	}

	.grid-line span {
		position: absolute;
		left: -4em;
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

	.annotation span {
		display: block;
		font-size: 14px;
	}

	path.data {
		stroke: none;
	}
</style>
