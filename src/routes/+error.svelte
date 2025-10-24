<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { RotateCcw, TriangleAlert } from '@lucide/svelte';
</script>

<div class="flex h-screen w-full flex-col items-center justify-center gap-2">
  <div class="flex flex-row items-center gap-2">
    <TriangleAlert class="text-destructive h-8 w-8" />
    <p>Something went wrong. Let's try again.</p>
  </div>
  <div class="flex gap-2">
    <Button variant="default" onclick={() => goto('/')} class="gap-2">
      <RotateCcw class="h-4 w-4" />
      Restart
    </Button>
  </div>
</div>
