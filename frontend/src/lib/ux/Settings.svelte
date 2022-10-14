<script lang="ts">
  import { createForm } from 'felte';
  import { validator } from '@felte/validator-zod';
  import { z } from 'zod';
  import { getNotificationsStore } from '$lib/stores/notifs';

  import Tooltip from '$lib/ux/forms/Tooltip.svelte';
  import { host_uri_store } from '$lib/stores/distributed/stats';
  const notifications = getNotificationsStore();

  const schema = z.object({
    url: z.string().url().endsWith('/statistics')
  });

  const { form, errors, isValid } = createForm<z.infer<typeof schema>>({
    onSubmit: (values: Record<string, string>) => {
      /* TODO: validate the address */
      fetch(values.url)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed testing connection to host');
          }
          return res.json();
        })
        .then((data) => {
          if (typeof data === 'object' && data['statistics']) {
            host_uri_store.set(values.url);
            console.log('Successfully tested connection to Host');
            notifications.success('Successfully tested connection to Host');
            notifications.success('`host_uri` has been set to ' + values.url);
          } else {
            throw new Error('Failed testing connection to host');
          }
        })
        .catch((e: ErrorEvent) => {
          console.log(e.message);
          notifications.error(`Failed testing connection to host`);
        });
    },
    extend: validator({ schema })
  });
</script>

<div class="flex flex-col gap-4 items-center p-1">
  <form use:form>
    <div class="flex flex-col gap-4 items-center">
      <div class="form-control w-full max-w-xs">
        <label for="email" class="label cursor-pointer gap-4">
          <span class="label-text">Host URI:</span>
        </label>
        <Tooltip errors={$errors.url}>
          <input type="url" id="url" placeholder={$host_uri_store} name="url" class="form-field" />
        </Tooltip>
      </div>
      <button class="btn" class:btn-disabled={!$isValid} type="submit">Save</button>
    </div>
  </form>
</div>
