<script lang="ts">
  import { getNotificationsStore } from '$lib/stores/notifs';
  import { fade, fly } from 'svelte/transition';
  import Info from '~icons/fluent/info-20-regular';
  import Check from '~icons/fluent/checkmark-20-regular';
  import Warning from '~icons/fluent/warning-20-regular';
  import Dismiss from '~icons/fluent/dismiss-20-regular';
  const notifications = getNotificationsStore();
  const typeClasses: Record<string, string> = {
    default: '',
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error'
  };
</script>

<div class="toast toast-top toast-end mt-20">
  {#each $notifications as { type, message, remove }}
    <div
      in:fly={{ x: 200, duration: 1000 }}
      out:fade={{ duration: 200 }}
      class="alert flex-row {typeClasses[type]}"
    >
      {#if type === 'default' || type === 'info'}
        <div class="h-10 w-10">
          <Info
            class="h-full w-full fill-none {type === 'default' ? 'stroke-info' : 'stroke-current'}"
          />
        </div>
      {:else if type === 'success'}
        <div class="h-10 w-10">
          <Check class="h-full w-full stroke-current fill-none" />
        </div>
      {:else if type === 'warning'}
        <div class="h-10 w-10">
          <Warning class="h-full w-full stroke-current fill-none" />
        </div>
      {:else}
        <div class="h-10 w-10">
          <Dismiss class="h-full w-full stroke-current fill-none" />
        </div>
      {/if}
      <span>{message}</span>
      <div class="divider divider-horizontal mx-0" />
      <button class="btn btn-ghost btn-xs btn-circle mr-0" on:click={remove}>
        <Dismiss class="h-full w-full stroke-current fill-none" />
      </button>
    </div>
  {/each}
</div>
