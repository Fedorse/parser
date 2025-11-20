<script lang="ts">
  import { parseQueue } from '$lib/state-utils/store-parse-queue.svelte';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import { FileClock, FileCheck, X } from '@lucide/svelte/icons';
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
                    class="text-muted-foreground hover:text-foreground"
                    aria-label="Remove from queue"
                    onclick={() => parseQueue.remove(parse.parse_id)}><X class="size-4" /></button
                  >
                {/if}
              </div>
              <div class="flex w-full justify-between">
                <div class="text-muted-foreground flex items-center gap-1.5 text-xs">
                  {parse.files_amount} Files
                  {#if parse.parse_progress === 100}
                    <div class="flex items-center gap-1.5">
                      <!-- svelte-ignore element_invalid_self_closing_tag -->
                      <div class="relative flex size-1.5">
                        <!-- svelte-ignore element_invalid_self_closing_tag -->
                        <div
                          class="bg-chart-2/50 absolute inline-flex h-full w-full animate-ping rounded-full"
                        />
                        <span class="bg-chart-2 relative inline-flex size-1.5 rounded-full" />
                      </div>
                      Ready
                    </div>
                  {:else}
                    <div class=" text-warn flex items-center gap-1.5 font-medium">
                      <div class="relative flex size-1.5">
                        <!-- svelte-ignore element_invalid_self_closing_tag -->
                        <span
                          class="bg-warn/50 absolute inline-flex h-full w-full animate-ping rounded-full"
                        />
                        <!-- svelte-ignore element_invalid_self_closing_tag -->
                        <span class="bg-warn relative inline-flex size-1.5 rounded-full" />
                      </div>
                      In progress
                    </div>
                  {/if}
                </div>
                <span class="text-muted-foreground text-sm">
                  {parse.parse_progress.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <Progress value={parse.parse_progress} class="mt-1 mb-3 h-1 " />
        </div>
      {/each}
    </div>
  </div>
{/if}
