import { readable } from 'svelte/store';
import { browser } from '$app/environment';
export type BaseStats = Record<string, { hits: number; seconds: number }>;
type ModelStats = Record<string, any> & { statistics: BaseStats };
export type DistTrainingStats = Record<string, ModelStats> & BaseStats;

export const ioStats = readable<{ timestamp: number; data: BaseStats }[]>([], (set) => {
	if (!browser) return;
	const values: { timestamp: number; data: BaseStats }[] = [];
	fetchStats()
		.then((data) => {
			values.push({ timestamp: new Date().getTime(), data });
			set(values);
		})
		.catch((err) => console.error(`Failed to fetch stats`, err));

	// query stats endpoints 10 x per second
	const id = setInterval(() => {
		fetchStats()
			.then((data) => {
				values.push({ timestamp: new Date().getTime(), data });
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
		.then((stats) => parseStats(stats));
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

const parseStats = (stats: DistTrainingStats) => {
	let route_stats = parseRouteStats(stats as ModelStats);
	for (const [key, data] of Object.entries(stats)) {
		if (key === 'statistics') continue;
		const model_stats = parseRouteStats(data, key);
		route_stats = { ...route_stats, ...model_stats };
	}
	return route_stats;
};
