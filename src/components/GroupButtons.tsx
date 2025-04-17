import { FileIcon, FolderIcon } from '../icons';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

const GroupButtons = ({ setShowPresets, showPresets, parse }) => {
	const handleOpenFile = async (directory: boolean) => {
		const selected = await open({
			multiple: true,
			directory
		});
		if (!selected) return;
		try {
			await parse(selected);
		} catch (err) {
			console.error('Parse failed:', err);
		}
	};

	return (
		<section className="w-1/2">
			<div className="w-full relative flex px-20 justify-around items-center gap-2 flex-row rounded-b-lg border border-gray-300 dark:border-gray-700">
				<button
					onClick={() => handleOpenFile(false)}
					className="bg-transparent items-center flex gap-2 rounded-lg hover:bg-gray-800 text-black/70 dark:text-gray-200 px-4 py-3 font-medium transition-colors"
				>
					<FileIcon />
					<span>Select Files</span>
				</button>

				<div className="flex flex-col ">
					<button
						onClick={() => setShowPresets(!showPresets)}
						className="w-full flex justify-between items-center bg-transparent rounded-lg px-4 py-2 text-black/70 dark:text-gray-200 hover:bg-gray-800 transition-colors"
					>
						preset
					</button>
				</div>
				{/* <div className="flex flex-col ">
					<button
						onClick={() => setShowNewPresets(!showNewPresets)}
						className="w-full flex justify-between items-center bg-transparent rounded-lg px-4 py-2 text-black/70 dark:text-gray-200 hover:bg-gray-800 transition-colors"
					>
						add new preset
					</button>
				</div> */}

				<button
					onClick={() => handleOpenFile(true)}
					className="min-w-36 bg-transparent rounded-lg items-center flex gap-2 hover:bg-gray-800 text-black/70 dark:text-gray-200 px-4 py-3 font-medium transition-colors"
				>
					<FolderIcon />
					<span>Select Folder</span>
				</button>
			</div>
		</section>
	);
};

export default GroupButtons;
