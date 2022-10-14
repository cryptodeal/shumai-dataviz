<script lang="ts">
  import Tooltip from '$lib/ux/Tooltip.svelte';
  export let errors: null | string[];
  $: open = errors && errors.length ? true : false;
</script>

<Tooltip
  color={'error'}
  hide={errors ? false : true}
  {open}
  dataTip={Array.isArray(errors) ? errors.join('; ') : errors}
>
  <slot />
</Tooltip>
