<script lang="ts">
  import { Keyboard, Command, Search, Save } from '@lucide/svelte/icons';
  import * as Kbd from '$lib/components/ui/kbd';
  import * as HoverCard from '$lib/components/ui/hover-card';
  import { Button } from '$lib/components/ui/button';

  const shortcuts = [
    { label: 'Save changes', keys: ['⌘', 'S'], icon: Save },
    { label: 'Search in file', keys: ['⌘', 'F'], icon: Search },
    { label: 'Command palette', keys: ['⌘', 'K'], icon: Command },
    { label: 'Close editor', keys: ['Esc'] }
  ];
</script>

<HoverCard.Root openDelay={200} closeDelay={100}>
  <HoverCard.Trigger>
    {#snippet child({ props })}
      <Button
        variant="ghost"
        size="sm"
        class="text-muted-foreground hover:text-foreground h-6 px-2"
        {...props}
      >
        <Keyboard class="size-3.5 stroke-[1.5]" />
        <span class="ml-1.5 hidden text-[10px] font-medium sm:inline-block">Shortcuts</span>
      </Button>
    {/snippet}
  </HoverCard.Trigger>
  <HoverCard.Content class="w-72 p-4" side="top" align="end">
    <div class="flex flex-col gap-4">
      <div class="space-y-1">
        <h4 class="text-sm leading-none font-semibold">Keyboard Shortcuts</h4>
        <p class="text-muted-foreground text-xs">Essential keys for quick editing.</p>
      </div>
      {#each shortcuts as item}
        <div class="flex items-center justify-between">
          <div class="text-muted-foreground flex items-center gap-2 text-sm">
            {#if item.icon}
              <item.icon class="size-3.5" />
            {/if}
            <span>{item.label}</span>
          </div>
          <div class="flex gap-1">
            {#each item.keys as key}
              <Kbd.Root class="h-5 min-w-[20px] px-1.5 text-[10px] uppercase">{key}</Kbd.Root>
            {/each}
          </div>
        </div>
      {/each}
    </div></HoverCard.Content
  >
</HoverCard.Root>
