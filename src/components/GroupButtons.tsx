import { FileIcon, FolderIcon } from '../icons';
import { open } from '@tauri-apps/plugin-dialog';

const GroupButtons = ({ parseFiles }) => {
	const handleFileSelect = async () => {
		const selected = await open({
			multiple: true
		});

		if (!selected) return;

		const files = Array.isArray(selected) ? selected : [selected];
		await parseFiles(files);
	};

	const handleFolderSelect = async () => {
		const selected = await open({
			multiple: true,
			directory: true
		});

		if (!selected) return;

		const files = Array.isArray(selected) ? selected : [selected];
		await parseFiles(files);
	};
	return (
		<section>
			<div className="inline-flex  justify-center items-center gap-2 flex-row rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 mt-6 ">
				<button
					onClick={handleFileSelect}
					className="bg-transparent items-center flex gap-2 rounded-lg hover:bg-gray-800 text-black/70 dark:text-gray-200 px-4 py-3  font-medium transition-colors"
				>
					<FileIcon />
					<span>Select Files</span>
				</button>

				<div className="flex items-center rounded-lg px-4 py-3 dark:text-gray-400 text-gray-400 shadow-md bg-white/10 dark:bg-gray-800/60">
					<span className="text-sm font-medium">/</span>
				</div>

				<button
					onClick={handleFolderSelect}
					className="min-w-36 bg-transparent rounded-lg items-center flex gap-2 hover:bg-gray-800 text-black/70 dark:text-gray-200  px-4 py-3  font-medium transition-colors"
				>
					<FolderIcon />
					<span>Select Folder</span>
				</button>
			</div>
		</section>
	);
};
export default GroupButtons;
