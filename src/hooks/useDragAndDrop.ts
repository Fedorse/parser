import { useEffect, useRef, useState } from 'react';
import { getCurrentWebview } from '@tauri-apps/api/webview';
export const useDragAndDrop = (parceCb) => {
	const [dragState, setDragState] = useState({
		isDragging: false,
		position: null,
		files: []
	});

	const unlistenRef = useRef(null);

	useEffect(() => {
		const currentWindow = getCurrentWebview();

		const setupListener = async () => {
			try {
				unlistenRef.current = await currentWindow.onDragDropEvent((event) => {
					const { type, position, paths } = event.payload;

					switch (type) {
						case 'over':
							console.log('over');
							setDragState({
								isDragging: true,
								position,
								files: []
							});
							break;
						case 'drop':
							console.log('drop');
							setDragState({
								isDragging: false,
								position,
								files: paths
							});
							parceCb(paths);
							break;
						case 'leave':
							console.log('leave');
							setDragState({
								isDragging: false,
								position: null,
								files: []
							});
							break;
						default:
							console.log('Unknown drag event type:', type);
					}
				});
			} catch (err) {
				console.error('Failed to set up drag and drop listener:', err);
			}
		};
		setupListener();

		return () => {
			if (unlistenRef.current) {
				unlistenRef.current();
			}
		};
	}, []);
	return dragState;
};
