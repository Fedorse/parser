<script>
  import { page } from '$app/state';
  import FileIcon from '@lucide/svelte/icons/file';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Grip from '@lucide/svelte/icons/grip-vertical';
  import ToggleThemeButton from '$lib/components/theme-switch-button.svelte';
  import Button from './ui/button/button.svelte';

  let homePage = $derived(page.route.id === '/');
</script>

<nav class="flex h-20 w-full items-center justify-between px-6 py-10">
  <!-- left: context action -->
  <div>
    {#if homePage}
      <!-- <a
        href="/files"
        class="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition"
      >
        <FileIcon class="size-5" />
        <span class="text-sm">Files</span>
      </a> -->
    {:else}
      <a
        href="/"
        class="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition"
      >
        <ArrowLeft class="size-5" />
        <span class="text-sm">Back</span>
      </a>
    {/if}
  </div>
  <!-- 
  <a href="/" class="group inline-flex items-center gap-2">
    <Grip class="size-5" />
    <span class="font-semibold tracking-tight">Parse</span>
    <span class="bg-primary/10 text-primary rounded-md px-1.5 py-0.5 text-[10px] leading-none"
      >beta</span
    >
  </a> -->

  <!-- right: actions -->
  <div class="flex items-center gap-2">
    <ToggleThemeButton />
    <!-- <Button variant="default" size="sm" href="/map">map</Button> -->
  </div>
</nav>
