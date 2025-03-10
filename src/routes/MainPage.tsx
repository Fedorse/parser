import DragAndDrop from '../components/DragAndDrop';
import GroupButtons from '../components/GroupButtons';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '../hooks/useToast';

export const MainPage = ({ reloadFiles }) => {
	const { success } = useToast();

	const parseFiles = async (files) => {
		await invoke('parse', {
			paths: files,
			ignorePatterns: []
		});
		success('Files parsed successfully!');

		await reloadFiles();
	};
	return (
		<main className="h-full flex flex-col items-center justify-center ">
			<DragAndDrop parseFiles={parseFiles} />
			<GroupButtons parseFiles={parseFiles} />
		</main>
	);
};
export default MainPage;
