import { derived, readable, writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { TreeMapDatum, TreeMapLastChild } from '$lib/viz/tree/types';
export type BaseStats = Record<
	string,
	{ hits: number; seconds: number; op_stats?: Record<string, { time: number; bytes: bigint }> }
>;
type ModelStats = Record<string, any> & { statistics: BaseStats; bytes_used: bigint };
export type DistTrainingStats = Record<string, ModelStats>;

export type ParsedStats = {
	route_stats: BaseStats;
	bytes_used: Record<string, bigint>;
	timestamp: number;
};

export const ioStats = readable<ParsedStats[]>([], (set) => {
	if (!browser) return;
	const values: ParsedStats[] = [];
	fetchStats()
		.then((data) => {
			values.push({ timestamp: new Date().getTime(), ...data });
			set(values);
		})
		.catch((err) => console.error(`Failed to fetch stats`, err));

	// query stats endpoints 10 x per second
	const id = setInterval(() => {
		fetchStats()
			.then((data) => {
				values.push({ timestamp: new Date().getTime(), ...data });
				set(values);
			})
			.catch((err) => console.error(`Failed to fetch`, err));
	}, 100);

	return () => {
		clearInterval(id);
	};
});

export const treeMapDatum = writable<
	Record<string, Record<string, { time: number; bytes: number }>>
>({});

export const tree_map_data = derived(treeMapDatum, ($treeMapDatum) => {
	let treeMapData: TreeMapDatum = { name: 'Distributed Training', children: [] };
	tree_map_data.subscribe((val) => {
		if (val) treeMapData = val;
	});
	Object.entries($treeMapDatum).forEach((val, i) => {
		// console.log(val);
		const [key, value] = val;
		const key_split = key.split(' ');
		const model_name = key_split.length > 1 ? `Model - ${key_split[0]}` : 'Model - (HOST)';
		const route_name =
			key_split.length > 1 ? `Route - "${key_split[1]}"` : `Route - "${key_split[0]}"`;

		let modelIdx = treeMapData.children.findIndex((x) => x.name === model_name);
		if (modelIdx === -1) {
			(treeMapData.children as TreeMapDatum[]).push({
				name: model_name,
				children: []
			});
			modelIdx = treeMapData.children.length - 1;
		}

		let route_idx = (
			(treeMapData.children as TreeMapDatum[])[modelIdx].children as TreeMapDatum[]
		).findIndex((x) => x.name === route_name);

		if (route_idx === -1) {
			((treeMapData.children as TreeMapDatum[])[modelIdx].children as TreeMapDatum[]).push({
				name: route_name,
				children: []
			});
			route_idx =
				((treeMapData.children as TreeMapDatum[])[modelIdx].children as TreeMapDatum[]).length - 1;
		}

		for (const [op_key, op_vals] of Object.entries(value)) {
			const op_name = op_key.split('@')[0];
			const op_idx = (
				((treeMapData.children as TreeMapDatum[])[modelIdx].children as TreeMapDatum[])[route_idx]
					.children as TreeMapLastChild[]
			).findIndex((op) => op.name === op_name);
			if (op_idx === -1) {
				(
					((treeMapData.children as TreeMapDatum[])[modelIdx].children as TreeMapDatum[])[route_idx]
						.children as TreeMapLastChild[]
				).push({
					name: op_name,
					value: op_vals.time,
					other_data: {
						bytes: op_vals.bytes
					}
				});
			} else {
				(
					((treeMapData.children as TreeMapDatum[])[modelIdx].children as TreeMapDatum[])[route_idx]
						.children as TreeMapLastChild[]
				)[op_idx].value = op_vals.time;

				(
					((treeMapData.children as TreeMapDatum[])[modelIdx].children as TreeMapDatum[])[route_idx]
						.children as TreeMapLastChild[]
				)[op_idx].other_data = {
					bytes: op_vals.bytes
				};
			}
		}
	});
	return treeMapData;
});

const fetchStats = () => {
	return fetch('http://localhost:3000/statistics')
		.then((res) => {
			if (!res.ok) throw new Error(`Error: !res.ok; ${res.status}`);
			return res.json();
		})
		.then((stats) => {
			// console.log(stats)
			return parseStats(stats);
		});
};

const parseRouteStats = (stats: ModelStats, model_name?: string) => {
	const route_stats: BaseStats = {};
	if (stats.statistics) {
		for (const [key, data] of <
			[
				string,
				{
					hits: number;
					seconds: number;
					op_stats?: Record<string, { time: number; bytes: bigint }>;
				}
			][]
		>Object.entries(stats.statistics)) {
			const new_stats = data.op_stats;
			if (new_stats) {
				let v: Record<string, Record<string, { time: number; bytes: number }>> = {};
				treeMapDatum.subscribe((val) => {
					v = val;
				});
				const used_key = model_name ? `${model_name} /${key}` : `/${key}`;
				if (!v[used_key]) {
					v[used_key] = {};
					const new_keys = Object.keys(new_stats);
					for (const k of new_keys) {
						v[used_key][k] = {
							time: new_stats[k].time,
							bytes: Number(new_stats[k].bytes)
						};
					}
				} else {
					const new_keys = Object.keys(new_stats);
					for (const k of new_keys) {
						if (!v[used_key][k]) {
							v[used_key][k] = {
								time: new_stats[k].time,
								bytes: Number(new_stats[k].bytes)
							};
						} else {
							const { time, bytes } = v[used_key][k];
							v[used_key][k].time = time * 0.1 + new_stats[k].time * 0.9;
							v[used_key][k].bytes = Number(bytes) * 0.1 + Number(new_stats[k].bytes) * 0.9;
						}
					}
				}
				treeMapDatum.set(v);
			}
			// if model_name is given as a param, prefix key with `model_name `
			route_stats[model_name ? `${model_name} /${key}` : `/${key}`] = data;
		}
	}
	return route_stats;
};

const parseBytesData = (stats: ModelStats, model_name?: string) => {
	const bytes_used: Record<string, bigint> = {};
	if (model_name) {
		bytes_used[`${model_name} - mem`] = stats.bytes_used;
	} else {
		bytes_used['mem'] = stats.bytes_used;
	}
	return bytes_used;
};

const parseStats = (stats: DistTrainingStats) => {
	let route_stats = parseRouteStats(stats as ModelStats);
	let bytes_used = parseBytesData(stats as ModelStats);
	for (const [key, data] of Object.entries(stats)) {
		if (key === 'statistics' || key === 'bytes_used' || key === 'op_stats') continue;
		const model_stats = parseRouteStats(data, key);
		const model_bytes_used = parseBytesData(data, key);
		route_stats = { ...route_stats, ...model_stats };
		bytes_used = { ...bytes_used, ...model_bytes_used };
	}
	return { route_stats, bytes_used };
};
