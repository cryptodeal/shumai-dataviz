<script lang="ts">
  import '../app.css';
  import { afterNavigate } from '$app/navigation';
  import Navbar from '$lib/ux/Navbar.svelte';
  import { themeChange } from 'theme-change';
  import { onMount } from 'svelte';
  export const ssr = false;
  let drawercontent: {
    scrollTop: number;
  } = {
    scrollTop: 0
  };
  let drawerContentScrollY = 0;
  function parseContentScroll() {
    drawerContentScrollY = drawercontent.scrollTop;
  }

  let drawersidebar: {
    scrollTop: number;
  };
  let drawerSidebarScrollY = 0;
  function parseSidebarScroll() {
    drawerSidebarScrollY = drawersidebar.scrollTop;
  }

  onMount(() => {
    localStorage.setItem('isMax', 'false');
    themeChange(false);
    parseContentScroll();
    parseSidebarScroll();
  });

  afterNavigate(() => {
    drawercontent.scrollTop = 0;
  });
</script>

<div
  bind:this={drawercontent}
  on:scroll={parseContentScroll}
  class="drawer-content"
  style="scroll-behavior: smooth; scroll-padding-top: 5rem;"
>
  <Navbar {drawerContentScrollY} />
  <div class="pt-6 px-2 pb-10 md:px-6">
    <slot />
  </div>
</div>
