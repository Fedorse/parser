<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import { setupThemes } from './utils';
  import { mode } from 'mode-watcher';

  let {
    value = $bindable(''),
    className = '',
    search = '',
    searchFound = $bindable(true)
  } = $props();

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
      },

      contextmenu: true,
      copyWithSyntaxHighlighting: false,
      useShadowDOM: false
    });

    editor.addAction({
      id: 'editor.action.clipboardCopyAction',
      label: 'Copy ',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: async (ed) => {
        const selection = ed.getSelection();
        if (selection) {
          const text = ed.getModel()?.getValueInRange(selection) || '';
          await navigator.clipboard.writeText(text);
        }
      }
    });

    editor.addAction({
      id: 'custom-paste',
      label: 'Paste ',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 2.5,
      run: async (ed) => {
        const text = await navigator.clipboard.readText();
        ed.executeEdits('paste', [
          {
            range: ed.getSelection()!,
            text: text,
            forceMoveMarkers: true
          }
        ]);
      }
    });

    editor.addAction({
      id: 'custom-cut',
      label: 'Cut ',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 0.5,
      run: async (ed) => {
        const selection = ed.getSelection();
        if (selection) {
          const text = ed.getModel()?.getValueInRange(selection) || '';

          await navigator.clipboard.writeText(text);
          ed.executeEdits('cut', [
            {
              range: selection,
              text: '',
              forceMoveMarkers: true
            }
          ]);
        }
      }
    });

    editor.addAction({
      id: 'open-command-palette-with-cmd-k',
      label: 'Command Palette',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 0,
      run: (ed) => {
        ed.getAction('editor.action.quickCommand')?.run();
      }
    });

    editor.onDidChangeModelContent(() => {
      value = editor!.getValue();
    });
  });

  $effect(() => {
    if (!editor) return;

    const q = search;
    if (!q) return;
    const header = `===== ${search} =====`;

    const model = editor.getModel();
    if (!model) return;

    const match = model.findNextMatch(
      header,
      { lineNumber: 1, column: 1 },
      /* isRegex */ false,
      /* matchCase */ false,
      /* wordSeparators */ null,
      /* captureMatches */ false
    );

    if (match) {
      editor.revealRangeInCenter(match.range);
      editor.setSelection(match.range);
      editor.focus();
      searchFound = true;
    } else {
      searchFound = false;
    }
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

<div bind:this={editorContainer} class={`bg-card/20 h-full w-full ${className}`} />

<style>
  :global(.monaco-menu .action-item:has(.action-label[aria-label='Copy'])),
  :global(.monaco-menu .action-item:has(.action-label[aria-label='Paste'])),
  :global(.monaco-menu .action-item:has(.action-label[aria-label='Cut'])) {
    display: none !important;
  }
  /* :global(.monaco-menu .separator) {
    display: none !important;
  } */
</style>
