<script lang="ts">
  import GithubIcon from '~icons/akar-icons/github-fill';
  import GearIcon from '~icons/akar-icons/gear';
  import ThemeToggle from '$lib/ux/ThemeToggle.svelte';
  import { BrowserOpenURL } from '$lib/wailsjs/runtime/runtime';
  import FramelessUi from './FramelessUI.svelte';
  export let drawerContentScrollY: number;
  $: switchNavbarStyle = drawerContentScrollY > 40 ? true : false;
</script>

<div
  style="--wails-draggable:drag;"
  class="sticky top-0 z-30 flex w-full justify-center bg-opacity-90 backdrop-blur transition-all duration-100 {switchNavbarStyle
    ? 'bg-base-100 text-base-content shadow-sm'
    : 'bg-base-100 text-base-content'}"
>
  <nav class="navbar w-full px-4">
    <div class="flex flex-1 md:gap-1 lg:gap-2">
      <FramelessUi />
      <!--
      <span
        class="tooltip tooltip-bottom before:text-xs before:content-[attr(data-tip)]"
        data-tip="Menu"
      >
        <label for="drawer" class="btn btn-square btn-ghost drawer-button">
          <svg
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block h-5 w-5 stroke-current md:h-6 md:w-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>
      </span>
      -->
      <div class="flex items-center gap-2">
        <a
          href="/"
          aria-current="page"
          aria-label="Homepage"
          class="flex-0 btn btn-ghost px-2 {switchNavbarStyle ? '' : 'hidden'}"
        >
          <div
            class="font-title text-primary inline-flex text-lg transition-all duration-200 md:text-3xl"
          >
            <span class={switchNavbarStyle ? 'text-primary' : 'text-primary-content'}>
              Shumai
            </span>
          </div>
        </a>
      </div>
    </div>
    <div class="flex-0 gap-2">
      <span
        class="tooltip tooltip-bottom before:text-xs before:content-[attr(data-tip)]"
        data-tip="GitHub"
      >
        <button
          aria-label="Github"
          rel="noopener"
          on:click={() => BrowserOpenURL('https://github.com/facebookresearch/shumai')}
          class="btn btn-sm btn-ghost btn-circle drawer-button normal-case"
        >
          <GithubIcon class="h-5 w-5 fill-current" />
        </button>
      </span>
      <span
        class="tooltip tooltip-bottom before:text-xs before:content-[attr(data-tip)]"
        data-tip="Theme"
      >
        <ThemeToggle />
      </span>
      <span
        class="tooltip tooltip-bottom before:text-xs before:content-[attr(data-tip)]"
        data-tip="Settings"
      >
        <label for="settings_modal" class="btn btn-sm btn-circle modal-button">
          <GearIcon class="h-5 w-5" />
        </label>
      </span>
    </div>
  </nav>
</div>
