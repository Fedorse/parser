import { invalidateAll } from '$app/navigation';
import { listen } from '@tauri-apps/api/event';

interface ParseProgress {
  parse_id: string;
  parse_progress: number;
  files_amount: number;
  result_file_path: string | null;
}
class ParseQueue {
  queue = $state<Map<string, ParseProgress>>(new Map());
  unlisten: (() => void) | undefined;

  constructor() {
    this.initListener();
    // this.seedMockData();
  }

  async initListener() {
    try {
      this.unlisten = await listen<ParseProgress>('parse-progress', (event) => {
        const progress = event.payload;
        const prev = this.queue.get(progress.parse_id);
        const isComplete = progress.parse_progress === 100;

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
          invalidateAll();
        }
      });
    } catch (error) {
      console.error('Failed to initialize parse progress listener:', error);
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
    return this.activeParses.length > 0;
  }
  add(progress: ParseProgress) {
    this.queue.set(progress.parse_id, progress);
    this.queue = new Map(this.queue);
  }

  remove(parseId: string) {
    this.queue.delete(parseId);
    this.queue = new Map(this.queue);
  }

  seedMockData() {
    const mock: ParseProgress[] = [
      {
        parse_id: '2025-11-11_14-30-45',
        parse_progress: 42.7,
        files_amount: 125,
        result_file_path: null
      },
      {
        parse_id: '2025-11-11_14-31-12',
        parse_progress: 78.3,
        files_amount: 89,
        result_file_path: null
      },
      {
        parse_id: '2025-11-11_14-29-03',
        parse_progress: 100,
        files_amount: 234,
        result_file_path:
          '/home/user/.tauri-parse-files/parsed_files/2025-11-11_14-29-03/content.txt'
      }
    ];

    for (const item of mock) {
      this.add(item);
    }
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
