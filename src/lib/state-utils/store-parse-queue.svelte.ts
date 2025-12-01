import { invalidateAll } from '$app/navigation';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { toast } from 'svelte-sonner';
import { set } from 'zod';

export type ParseProgress = {
  parse_id: string;
  parse_progress: number;
  files_amount: number;
  result_file_path: string | null;
};
class ParseQueue {
  queue = $state<Map<string, ParseProgress>>(new Map());
  isSideBarOpen = $state(false);
  pendingCount = $state(0);
  autoOpen = $state(true);

  private unlistenFn: UnlistenFn | undefined;
  private processedIds = new Set<string>();

  constructor() {}

  async mount() {
    const storedAutoOpen = localStorage.getItem('parse-queue-auto-open');
    if (storedAutoOpen !== null) {
      this.autoOpen = storedAutoOpen === 'true' ? true : false;
    }

    if (this.unlistenFn) return;

    try {
      this.unlistenFn = await listen<ParseProgress>('parse-progress', (event) => {
        const progress = event.payload;
        const id = progress.parse_id;
        const isComplete = progress.parse_progress >= 100;

        if (this.processedIds.has(id)) return;

        if (!this.queue.has(id)) {
          if (this.pendingCount > 0) {
            this.pendingCount--;
          }
        }

        // throtle for progress updates

        const prev = this.queue.get(id);
        const MIN_STEP = 0.5;
        if (
          !isComplete &&
          prev &&
          Math.abs(progress.parse_progress - prev.parse_progress) < MIN_STEP
        ) {
          return;
        }

        this.add(progress);

        if (isComplete) {
          this.processedIds.add(id);
          toast.success(`Parsing completed`);
          invalidateAll();
        }
      });
    } catch (error) {
      console.error('Failed to initialize parse progress listener:', error);
    }
  }
  unmount() {
    if (this.unlistenFn) {
      this.unlistenFn();
      this.unlistenFn = undefined;
    }
  }

  get size() {
    return this.queue.size;
  }

  get activeParses() {
    return Array.from(this.queue.values()).filter((p) => p.parse_progress < 100);
  }

  get completedParses() {
    return Array.from(this.queue.values()).filter((p) => p.parse_progress === 100);
  }

  get hasActiveParsing() {
    return this.activeParses.length > 0 || this.pendingCount > 0;
  }

  toggleAutoOpen() {
    this.autoOpen = !this.autoOpen;
    localStorage.setItem('parse-queue-auto-open', String(this.autoOpen));
  }

  addPendingRequest() {
    this.pendingCount += 1;
    if (this.autoOpen) {
      this.setOpen(true);
    }
  }

  cancelPendingRequest() {
    if (this.pendingCount > 0) {
      this.pendingCount -= 1;
    }
  }

  add(progress: ParseProgress) {
    this.queue.set(progress.parse_id, progress);
    this.queue = new Map(this.queue);
  }

  setOpen(value: boolean) {
    this.isSideBarOpen = value;
  }

  remove(parseId: string) {
    this.queue.delete(parseId);
    this.queue = new Map(this.queue);
  }

  clearCompleted() {
    for (const [id, parse] of this.queue.entries()) {
      if (parse.parse_progress === 100) {
        this.queue.delete(id);
      }
    }
    this.queue = new Map(this.queue);
  }
}
export const parseQueue = new ParseQueue();
