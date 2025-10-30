<script lang="ts">
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';

  type Props = {
    confirmDialogOpen: boolean;
    dialogTitle?: string;
    dialogDescription?: string;
    confirmText?: string;
    cancelText?: string;
    handleConfirm?: () => void;
    handleCancel?: () => void;
    Confirm?: () => any;
    Cancel?: () => any;
  };
  let {
    confirmDialogOpen,
    dialogDescription,
    dialogTitle = 'Are you absolutely sure?',
    handleCancel,
    handleConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    Confirm,
    Cancel
  }: Props = $props();
</script>

<AlertDialog.Root open={confirmDialogOpen}>
  <AlertDialog.Content escapeKeydownBehavior="ignore">
    <AlertDialog.Header>
      <AlertDialog.Title>{dialogTitle}</AlertDialog.Title>
      {#if dialogDescription}
        <AlertDialog.Description class="line-clamp-2  block max-w-md 2xl:max-w-lg"
          >{dialogDescription}</AlertDialog.Description
        >
      {/if}
    </AlertDialog.Header>
    <AlertDialog.Footer class="gap-2">
      {#if Cancel}
        {@render Cancel()}
      {:else}
        <AlertDialog.Cancel onclick={() => handleCancel?.()}>{cancelText}</AlertDialog.Cancel>
      {/if}
      {#if Confirm}
        {@render Confirm()}
      {:else}
        <AlertDialog.Action onclick={() => handleConfirm?.()}>{confirmText}</AlertDialog.Action>
      {/if}
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
