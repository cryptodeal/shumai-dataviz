import { readable } from 'svelte/store';
import { browser } from '$app/environment';
export type BaseStats = Record<string, { hits: number; seconds: number }>;
type ModelStats = Record<string, any> & { statistics: BaseStats; bytes_used: number };
export type DistTrainingStats = Record<string, ModelStats>;

export type ParsedStats = {
	route_stats: BaseStats;
	bytes_used: Record<string, number>;
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
		for (const [key, data] of <[string, { hits: number; seconds: number }][]>(
			Object.entries(stats.statistics)
		)) {
			// if model_name is defined, append to key
			route_stats[model_name ? `${model_name} /${key}` : `/${key}`] = data;
		}
	}
	return route_stats;
};

const parseBytesData = (stats: ModelStats, model_name?: string) => {
	const bytes_used: Record<string, number> = {};
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
		if (key === 'statistics' || key === 'bytes_used') continue;
		const model_stats = parseRouteStats(data, key);
		const model_bytes_used = parseBytesData(data, key);
		route_stats = { ...route_stats, ...model_stats };
		bytes_used = { ...bytes_used, ...model_bytes_used };
	}
	return { route_stats, bytes_used };
};
