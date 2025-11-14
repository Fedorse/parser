<script lang="ts">
  import { FileClock, FileCheck, X } from '@lucide/svelte/icons';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import { parseQueue } from '$lib/state-utils/store-parse-queue.svelte';
</script>

{#if parseQueue.size > 0}
  <div class="px-6">
    <div class="flex flex-col rounded-xl border px-3 py-1">
      {#each Array.from(parseQueue.queue.values()) as parse (parse.parse_id)}
        <div class="flex flex-col items-center justify-between border-b pt-1 last:border-b-0">
          <div class="flex w-full items-center gap-2">
            {#if parse.parse_progress === 100}
              <FileCheck class="text-muted-foreground size-6 stroke-1" />
            {:else}
              <FileClock class="text-muted-foreground size-6 stroke-1" />
            {/if}
            <div class="flex w-full flex-col gap-0.5">
              <div class="flex items-center justify-between">
                <p class="text-sm">{parse.parse_id}</p>
                {#if parse.parse_progress === 100}
                  <button
                    class="hover:bg-muted hover:text-foreground"
                    aria-label="Remove from queue"
                    onclick={() => parseQueue.remove(parse.parse_id)}><X class="size-4" /></button
                  >
                {/if}
              </div>
              <div class="flex w-full justify-between">
                <p class="text-muted-foreground text-xs">
                  {parse.files_amount} files • {parse.parse_progress === 100
                    ? 'complete'
                    : 'in progress'}
                </p>
                <span class="text-sm">
                  {parse.parse_progress.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <Progress value={parse.parse_progress} class="mt-1 mb-3 h-1 " />
          <!-- {#if parse.result_file_path}
              <p class="text-muted-foreground flex self-start truncate text-xs">
                {parse.result_file_path}
              </p>
            {/if} -->
        </div>
      {/each}
    </div>
  </div>
{/if}
