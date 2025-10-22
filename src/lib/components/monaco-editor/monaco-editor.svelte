<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import { setupThemes } from './utils';
  import { mode } from 'mode-watcher';

  let { value = $bindable(''), className = '' } = $props();

  let editor: Monaco.editor.IStandaloneCodeEditor | null = $state(null);
  let editorContainer: HTMLElement | null = $state(null);
  let monaco: typeof Monaco | null = $state(null);

  onMount(async () => {
    monaco = (await import('./setup')).default;
    await setupThemes(monaco);

    // Editor initialization
    editor = monaco.editor.create(editorContainer!, {
      value,
      minimap: { enabled: false },
      language: 'plaintext',
      automaticLayout: true,
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      wordBasedSuggestions: 'currentDocument',
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
        alwaysConsumeMouseWheel: false
      }
    });

    editor.onDidChangeModelContent(() => {
      value = editor!.getValue();
    });
  });

  $effect(() => {
    if (editor) {
      const v = editor.getValue();
      if (value !== v) editor.setValue(value ?? '');
    }
  });

  $effect(() => {
    if (!editor) return;
    if (mode.current === 'dark') {
      editor.updateOptions({ theme: 'dark' });
    } else {
      editor.updateOptions({ theme: 'light' });
    }
  });

  onDestroy(() => {
    const model = editor?.getModel();
    model?.dispose();
    editor?.dispose();
  });
</script>

<div bind:this={editorContainer} class={`h-full w-full ${className}`} />
