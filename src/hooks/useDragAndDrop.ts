import { useEffect, useRef, useState } from 'react';
import { getCurrentWebview } from '@tauri-apps/api/webview';

type DragState = {
	isDragging: boolean;
	position: { x: number; y: number } | null;
	files: string[];
};

type DragEventPayload = {
	type: 'over' | 'drop' | 'leave' | 'enter'; // добавим enter
	position: { x: number; y: number };
	paths: string[];
};

export const useDragAndDrop = (parseCb: (paths: string[]) => void) => {
	const [dragState, setDragState] = useState<DragState>({
		isDragging: false,
		position: null,
		files: []
	});

	const unlistenRef = useRef<() => void | null>(null);

	useEffect(() => {
		let aborted = false;

		const setup = async () => {
			try {
				const currentWindow = getCurrentWebview();
				const unlisten = await currentWindow.onDragDropEvent((event) => {
					const { type, position, paths } = event.payload as DragEventPayload;

					switch (type) {
						case 'over':
							setDragState({ isDragging: true, position, files: [] });
							break;
						case 'drop':
							setDragState({ isDragging: false, position, files: paths });
							parseCb(paths);
							break;
						case 'leave':
							setDragState({ isDragging: false, position: null, files: [] });
							break;
						default:
							console.warn(`[useDragAndDrop:] unknown type:`, type);
					}
				});

				if (aborted) {
					unlisten();
				} else {
					unlistenRef.current = unlisten;
				}
			} catch (err) {
				console.error(`[useDragAndDrop:] Failed to setup listener:`, err);
			}
		};

		setup();

		return () => {
			aborted = true;
			if (unlistenRef.current) {
				unlistenRef.current();
				unlistenRef.current = null;
			}
		};
	}, [parseCb]);

	return dragState;
};
