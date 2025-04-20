import DragAndDrop from '../components/DragAndDrop';
import ButtonUploads from '../components/ButtonUploads';
import { invoke } from '@tauri-apps/api/core';
import { usePreset } from '../hooks/usePresset';
import { useToast } from '../hooks/useToast';

export const MainScreen = () => {
	const { presets, selected } = usePreset();
	const { success, error } = useToast();

	const parse = async (selectedPaths: string[]) => {
		try {
			await invoke('parse', {
				paths: selectedPaths,
				ignorePatterns: selected ? presets[selected] : []
			});
			success('Files parsed successfully');
		} catch (err) {
			error('Failed to parse files:');
		}
	};

	return (
		<main className="h-full flex flex-col w-full items-center justify-center overflow-hidden">
			<DragAndDrop parse={parse} />
			<ButtonUploads parse={parse} />
		</main>
	);
};
export default MainScreen;
