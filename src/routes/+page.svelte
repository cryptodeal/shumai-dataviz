<script lang="ts">
	import { ioStats, tree_map_data } from '$lib/stores/distributed/stats';
	import Line from '$lib/viz/Line.svelte';
	import TreeMap from '$lib/viz/tree/TreeMap.svelte';

	let parsed_stats: Record<string, { x: number; y: number; label?: string }[]> = {};
	let req_per_sec: Record<string, { x: number; y: number; label?: string }[]> = {};
	let bytes_data: Record<string, { x: number; y: number; label?: string }[]> = {};

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

	const format_tooltip_hits = (
		closest: { x: number; y: number; label?: string } & Record<string, number | string>
	) => {
		return `<strong class="text-secondary-content">${closest.label}</strong>
					<span class="text-sm text-secondary-content">@ ${format_x_label(closest.x)}</span>
					<strong class="text-secondary-content">Hits: </strong>
					<span class="text-secondary-content">${closest.y}</span>`;
	};

	const format_tooltip_avg_req_time = (
		closest: { x: number; y: number; label?: string } & Record<string, number | string>
	) => {
		return `<strong class="text-secondary-content">${closest.label}</strong>
					<span class="text-sm text-secondary-content">@ ${format_x_label(closest.x)}</span>
					<strong class="text-secondary-content">Req/Sec: </strong>
					<span class="text-secondary-content">${closest.y}</span>`;
	};

	const format_tooltip_bytes = (
		closest: { x: number; y: number; label?: string } & Record<string, number | string>
	) => {
		return `<strong class="text-secondary-content">${closest.label}</strong>
					<span class="text-sm text-secondary-content">@ ${format_x_label(closest.x)}</span>
					<strong class="text-secondary-content">Mem Usg: </strong>
					<span class="text-secondary-content">${closest.y} bytes</span>`;
	};
</script>

<div class="flex flex-col gap-10">
	<h1 class="text-center">Shumai Distributed Training Analytics</h1>
	<div class="items-center justify-center grid grid-cols-1 md:grid-cols-2 gap-10">
		<Line
			{format_x_label}
			format_y_label={format_y_label_hits}
			data={parsed_stats}
			format_tooltip={format_tooltip_hits}
		>
			<h2 slot="title">Route Statistics</h2>
		</Line>

		<Line
			{format_x_label}
			format_y_label={format_y_label_avg_req_time}
			data={req_per_sec}
			format_tooltip={format_tooltip_avg_req_time}
		>
			<h2 slot="title">Avg. Req/Sec By Route</h2>
		</Line>

		<Line
			{format_x_label}
			format_y_label={format_y_label_bytes}
			data={bytes_data}
			format_tooltip={format_tooltip_bytes}
		>
			<h2 slot="title">Memory Usage (Bytes)</h2>
		</Line>
	</div>
</div>
<TreeMap data={$tree_map_data}>
	<h2 slot="title">Tensor Ops TreeMap</h2>
</TreeMap>
