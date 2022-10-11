<script lang="ts">
  import {
    WindowUnfullscreen,
    WindowFullscreen,
    WindowMinimise,
    Quit
  } from '$lib/wailsjs/runtime/runtime.js';
  import { WindowState } from '$lib/stores/WindowState';
  import FullScreenIcon from '~icons/akar-icons/enlarge';
  import QuitIcon from '~icons/akar-icons/cross';
  import MinusIcon from '~icons/akar-icons/minus';
  import UnfullScreenIcon from '~icons/akar-icons/reduce';
  let isFullscreen = true,
    isMinimized = false;
  $: isFullscreen = $WindowState.isFullscreen;
  $: isMinimized = $WindowState.isMinimized;

  $: console.log($WindowState);
  function toggleFullscreen() {
    if (isFullscreen === false) {
      isFullscreen = true;
      WindowFullscreen();
    } else {
      isFullscreen = false;
      WindowUnfullscreen();
    }
  }
</script>

<div class="inline-flex gap-2">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="btn btn-xs btn-circle btn-outline" on:click={() => Quit()}>
    <QuitIcon class="fill-current w-3 h-3" />
  </label>

  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label
    class="btn btn-xs btn-circle btn-outline"
    class:btn-disabled={isFullscreen || isMinimized}
    on:click={() => WindowMinimise()}
  >
    <MinusIcon class="fill-current w-3 h-3" />
  </label>

  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label
    class="btn btn-xs btn-circle btn-outline swap swap-rotate"
    class:swap-active={isFullscreen}
    on:click={toggleFullscreen}
  >
    <UnfullScreenIcon class="swap-on fill-current w-3 h-3" />
    <FullScreenIcon class="swap-off fill-current w-3 h-3" />
  </label>
</div>
