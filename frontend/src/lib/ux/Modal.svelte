<script lang="ts">
  export let modalId: string;
</script>

<!-- Put this part before </body> tag -->
<input type="checkbox" id={modalId} class="modal-toggle" />
<label for={modalId} class="modal cursor-pointer">
  <label class="modal-box relative" for="">
    <slot name="header" />
    <slot name="content" />
  </label>
</label>
