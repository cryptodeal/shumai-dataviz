<script lang="ts">
	import TreemapNode from './Node.svelte';
	import type { HierarchyRectangularNode } from 'd3-hierarchy';
	import type { Tree } from './types';

	export let root: HierarchyRectangularNode<Tree>;
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
