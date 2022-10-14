<script lang="ts">
  export let dataTip: string | null,
    hide = false,
    color:
      | undefined
      | 'primary'
      | 'secondary'
      | 'accent'
      | 'info'
      | 'success'
      | 'warning'
      | 'error' = undefined,
    position: 'top' | 'bottom' | 'left' | 'right' = 'top',
    open = false;
  $: primary = color === 'primary';
  $: secondary = color === 'secondary';
  $: accent = color === 'accent';
  $: info = color === 'info';
  $: success = color === 'success';
  $: warning = color === 'warning';
  $: error = color === 'error';
  $: right = position === 'right';
  $: left = position === 'left';
  $: bottom = position === 'bottom';
</script>

<span
  class:tooltip={!hide}
  class:tooltip-primary={primary}
  class:tooltip-secondary={secondary}
  class:tooltip-accent={accent}
  class:tooltip-info={info}
  class:tooltip-success={success}
  class:tooltip-warning={warning}
  class:tooltip-error={error}
  class:tooltip-bottom={bottom}
  class:tooltip-left={left}
  class:tooltip-right={right}
  class:tooltip-open={open}
  data-tip={dataTip}
  class="before:text-xs before:content-[attr(data-tip)]"
>
  <slot />
</span>
