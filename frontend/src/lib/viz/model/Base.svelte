<script lang="ts">
  import * as Pancake from '@sveltejs/pancake';
</script>

<div class="geo_net_chart">
  <Pancake.Chart x1={-100} x2={100} y1={-100} y2={100}>
    <Pancake.Grid horizontal count={1} let:value>
      <div class="grid-line horizontal" />
      <div class="grid-line vertical x label first" />
      <div class="grid-line vertical x label" />
    </Pancake.Grid>

    <Pancake.Grid vertical count={1} let:value let:first>
      <div class="grid-line vertical" />
      <div class="grid-line horizontal y label first" />
      <div class="grid-line horizontal y label" />
    </Pancake.Grid>
  </Pancake.Chart>
</div>

<style>
  .geo_net_chart {
    width: 300px;
    height: 300px;
  }

  .grid-line {
    position: relative;
    display: block;
  }

  .grid-line.horizontal {
    width: 100%;
    left: 0;
    border-bottom: 2px solid rgba(0, 0, 0, 0.6);
  }

  .grid-line.vertical {
    height: 100%;
    bottom: 0;
    border-left: 2px solid rgba(0, 0, 0, 0.6);
  }

  .label {
    position: absolute;
    line-height: 1;
    white-space: nowrap;
  }

  .y.label {
    bottom: calc((100% / 6) * 5);
    width: 0.5rem;
    left: -0.5rem;
  }

  .y.label.first {
    bottom: calc(100% / 6);
    width: 0.5rem;
    left: -0.5rem;
  }

  .x.label.first {
    left: calc(100% / 6);
    height: 0.5rem;
    bottom: -0.5rem;
  }

  .x.label {
    left: calc((100% / 6) * 5);
    height: 0.5rem;
    bottom: -0.5rem;
  }
</style>
