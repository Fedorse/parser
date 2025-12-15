<script lang="ts">
  import { fly } from 'svelte/transition';
  import { expoOut, sineIn } from 'svelte/easing';
  import { onNavigate } from '$app/navigation';
  import { page } from '$app/state';

  type TransitionDirection = 'forward' | 'backward' | 'none';

  const OFFSET = 30;
  const DURATION = 200;

  let { children } = $props();
  let direction = $state<TransitionDirection>('none');

  onNavigate((navigation) => {
    if (!navigation.to || !navigation.from) {
      direction = 'none';
      return;
    }
    const toPath = navigation.to.url.pathname.split('/').filter(Boolean).length;
    const fromPath = navigation.from.url.pathname.split('/').filter(Boolean).length;

    if (toPath === fromPath) {
      direction = 'none';
    } else {
      direction = toPath > fromPath ? 'forward' : 'backward';
    }
  });

  const inParams = $derived.by(() => {
    const multiplier = direction === 'forward' ? 1 : direction === 'backward' ? -1 : 0;
    return {
      x: multiplier * OFFSET,
      duration: DURATION,
      easing: expoOut,
      delay: 200,
      opacity: 0
    };
  });

  const outParams = $derived.by(() => {
    const multiplier = direction === 'forward' ? 1 : direction === 'backward' ? -1 : 0;
    return {
      x: multiplier * -OFFSET,
      duration: DURATION,
      easing: sineIn,
      opacity: 0
    };
  });
</script>

<main class="grid flex-1 px-6">
  {#key page.url.pathname}
    <div class=" col-start-1 row-start-1 h-full w-full" in:fly={inParams} out:fly={outParams}>
      {@render children()}
    </div>
  {/key}
</main>
