<script lang="ts">
	import TreemapNode from './Node.svelte';

	export let root: {
		x0: number;
		x1: number;
		y0: number;
		y1: number;
		children: any[];
	};
</script>

<pancake-treemap>
	<TreemapNode node={root} let:node>
		<slot {node} />
	</TreemapNode>
</pancake-treemap>

<style>
	pancake-treemap {
		position: absolute;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
