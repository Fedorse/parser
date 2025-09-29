<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Code, Copy } from '@lucide/svelte/icons';
  import { Button } from '$lib/components/ui/button/index';
  import Badge from '$lib/components/ui/badge/badge.svelte';

  let {
    fileContent,
    selectedFile,
    updateFileContent,
    isCodeDialogOpen = $bindable(false)
  } = $props();

  let isCopied = $state(false);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      isCopied = true;
      setTimeout(() => (isCopied = false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };
</script>

<Dialog.Root bind:open={isCodeDialogOpen}>
  <Dialog.Content class="flex h-[90vh] w-[80vw] flex-col">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        <Code class="h-4 w-4" />
        {selectedFile?.name || 'File Content'}
      </Dialog.Title>
    </Dialog.Header>

    <div class="flex min-h-0 flex-1 flex-col">
      <div class="mb-3 flex items-center justify-between">
        <Badge variant="secondary">
          {selectedFile?.path}
        </Badge>
        <Button variant="outline" size="sm" onclick={() => handleCopy(fileContent)}
          >{#if !isCopied}
            <Copy class="mr-2 h-4 w-4" />
            Copy
          {:else}
            <Copy class="mr-2 h-4 w-4 text-green-700" />
            <span class="text-green-700"> Copied </span>
          {/if}</Button
        >
      </div>

      <div class="bg-muted/50 min-h-0 flex-1 rounded-md border">
        <textarea
          bind:value={fileContent}
          class="h-full w-full resize-none overflow-auto p-4 font-mono text-sm whitespace-pre-wrap"
        >
          {fileContent}
        </textarea>
      </div>
    </div>

    <div class="flex justify-end pt-4">
      <Button variant="outline" onclick={() => updateFileContent(fileContent)}>Save</Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
