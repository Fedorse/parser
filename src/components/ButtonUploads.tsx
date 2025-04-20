import { open } from '@tauri-apps/plugin-dialog';
import { FileIcon, FolderIcon } from '../icons';

type Props = {
	parse: (selected: string[]) => void;
};

const ButtonUploads = ({ parse }: Props) => {
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
		<section className="w-full max-w-3xl ">
			<div className="w-full relative flex flex-col sm:flex-row items-center justify-center px-4 py-3 gap-2 rounded-b-lg border border-t-0 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-600/50 transition-colors">
				<div className="flex justify-center w-full">
					<div className="inline-flex items-center border border-gray-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-800">
						<button
							onClick={(e) => handleOpenFile(false)}
							className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white"
						>
							<FileIcon />
						</button>

						<div className="py-2 w-px h-6 bg-gray-300 dark:bg-slate-700" />

						<button
							onClick={() => handleOpenFile(true)}
							className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white"
						>
							<FolderIcon />
						</button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ButtonUploads;
