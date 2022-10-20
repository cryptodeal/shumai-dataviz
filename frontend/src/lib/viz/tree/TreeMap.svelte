<script lang="ts">
  import { hierarchy as d3_hierarchy, treemap as d3_treemap } from 'd3-hierarchy';
  import * as Pancake from '@sveltejs/pancake';
  import ChartWrapper from '$lib/ux/ChartWrapper.svelte';
  import Map from '$lib/viz/tree/Map.svelte';
  import type { HierarchyNode, HierarchyRectangularNode } from 'd3-hierarchy';
  import { fade } from 'svelte/transition';
  import { tweened } from 'svelte/motion';
  import * as eases from 'svelte/easing';
  import type { Tree, TreeMapDatum } from './types';
  export let data: TreeMapDatum;

  const breadcrumbs = (node: HierarchyNode<Tree>) => {
    const crumbs: string[] = [];
    let tempNode: null | HierarchyNode<Tree> = node;
    while (tempNode) {
      crumbs.unshift(tempNode.data.name);
      tempNode = tempNode.parent;
    }
    return crumbs;
  };

  $: crumbs = breadcrumbs(selected);

  const extents = tweened<{ x1: number; x2: number; y1: number; y2: number }>(undefined, {
    duration: 500,
    easing: eases.cubicOut
  });

  const is_visible = (a: HierarchyNode<Tree>, b: HierarchyNode<Tree>) => {
    let comp: HierarchyNode<Tree> | null = b;
    while (comp) {
      if (a.parent === comp) return true;
      comp = comp.parent;
    }
    return false;
  };

  let hierarchy: HierarchyNode<Tree>, root: HierarchyRectangularNode<Tree>;
  const treemap = d3_treemap();

  $: hierarchy = d3_hierarchy(data as Tree)
    .sum((d) => d.value)
    .sort((a, b) => b.height - a.height);

  $: root = <HierarchyRectangularNode<Tree>>treemap(hierarchy);

  let selected: HierarchyRectangularNode<Tree>;

  const isMatch = (v: HierarchyNode<Tree>, comp: HierarchyNode<Tree>) => {
    if (v.data.name === comp.data.name) {
      return comp.data.name;
    } else {
      return false;
    }
  };
  const find_selected = (v: HierarchyRectangularNode<Tree>) => {
    if (isMatch(v, hierarchy)) return hierarchy as HierarchyRectangularNode<Tree>;
    if (hierarchy.children) {
      for (let i = 0; i < hierarchy.children.length; i++) {
        if (isMatch(v, hierarchy.children[i]))
          return hierarchy.children[i] as HierarchyRectangularNode<Tree>;
        const child = hierarchy.children[i];
        if (child.children) {
          for (let j = 0; j < child.children.length; j++) {
            if (isMatch(v, child.children[j]))
              return child.children[j] as HierarchyRectangularNode<Tree>;
          }
        }
      }
    }
  };

  $: selected = !selected ? root : find_selected(selected) || root;
  const select = (node: HierarchyRectangularNode<Tree>) => {
    while (node.parent && node.parent !== selected) {
      node = node.parent;
    }

    if (node && node.children) selected = node;
  };

  function handle_breadcrumbs() {
    selected = selected.parent as HierarchyRectangularNode<Tree>;
  }

  $: $extents = {
    x1: selected?.x0,
    x2: selected?.x1,
    y1: selected?.y1,
    y2: selected?.y0
  };
</script>

<div class="sm:container sm:mx-auto">
  <ChartWrapper>
    <div class="text-center my-10">
      <slot name="title" />
    </div>
    <button
      class="text-sm breadcrumbs tree_breadcrumbs"
      disabled={!selected.parent}
      on:click={handle_breadcrumbs}
    >
      <ul>
        {#each crumbs as crumb}
          <li>{crumb}</li>
        {/each}
      </ul>
    </button>
    <div class="chart">
      <Pancake.Chart x1={$extents.x1} x2={$extents.x2} y1={$extents.y1} y2={$extents.y2}>
        <Map {root} let:node>
          {#if is_visible(node, selected)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              transition:fade={{ duration: 350 }}
              class="node"
              class:leaf={!node.children}
              on:click={() => select(node)}
            >
              <div class="tree_contents">
                <strong>{node.data.name}</strong>
                <span>Avg Exec. Time: {node.value.toFixed(4)}</span>
              </div>
            </div>
          {/if}
        </Map>
      </Pancake.Chart>
    </div>
  </ChartWrapper>
</div>

<style>
  .tree_breadcrumbs:disabled {
    cursor: default;
  }

  .chart {
    width: calc(100% + 2px);
    height: 400px;
    padding: 0;
    margin: 0 -1px 36px -1px;
    overflow: hidden;
  }

  .tree_contents {
    width: 100%;
    height: 100%;
    padding: 0.3rem 0.4rem;
    box-sizing: border-box;
    @apply bg-primary bg-opacity-60 border-2 rounded-md text-primary-content border-primary-content;
  }
  .node {
    position: absolute;
    width: 100%;
    background: white;
    height: 100%;
    overflow: hidden;
    pointer-events: all;
    @apply rounded-md border-0;
  }

  .tree_breadcrumbs:disabled {
    cursor: default;
  }

  .node:not(.leaf) {
    cursor: pointer;
  }

  .node:not(.leaf) .tree_contents {
    @apply bg-primary border-2 rounded-md text-primary-content border-primary-content;
  }

  strong,
  span {
    display: block;
    font-size: 12px;
    white-space: nowrap;
    line-height: 1;
  }
</style>
