<script lang="ts">
  import '../app.css';
  import { writable } from 'svelte/store';
  import { getNotificationsStore } from '$lib/stores/notifs';
  import { afterNavigate } from '$app/navigation';
  import Navbar from '$lib/ux/Navbar.svelte';
  import { themeChange } from 'theme-change';
  import { onMount, setContext } from 'svelte';
  import Modal from '$lib/ux/Modal.svelte';
  import Settings from '$lib/ux/Settings.svelte';
  import Toast from '$lib/ux/Toast.svelte';
  export const ssr = false;

  let isHitsVisible = writable(true);
  setContext('isHitsVisible', isHitsVisible);
  let isAvgReqTimeVisible = writable(true);
  setContext('isAvgReqTimeVisible', isAvgReqTimeVisible);
  let isMemVisible = writable(true);
  setContext('isMemVisible', isMemVisible);
  let largeCharts = writable(false);
  setContext('largeCharts', largeCharts);

  let drawercontent: {
    scrollTop: number;
  } = {
    scrollTop: 0
  };
  let drawerContentScrollY = 0;
  function parseContentScroll() {
    drawerContentScrollY = drawercontent.scrollTop;
  }

  // init global notification store
  getNotificationsStore();

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
  <div class="pt-0 px-2 pb-10 md:px-6">
    <slot />
  </div>
</div>

<!-- settings modal -->
<Modal modalId="settings_modal">
  <div slot="header">
    <h3 class="text-lg font-bold text-center py-4">Settings</h3>
  </div>
  <svelte:fragment slot="content">
    <Settings />
  </svelte:fragment>
</Modal>

<!-- svelte toast notifications -->
<Toast />
