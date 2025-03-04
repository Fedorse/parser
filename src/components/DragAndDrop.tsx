import { InputIcon, FolderIcon, FileIcon } from '../icons';
export const DragAndDrop = ({ handleFileSelect, handleFolderSelect }) => {
	return (
		<div className="flex flex-col items-center justify-center ">
			<div className="text-center">
				<h2 className="text-xl text-white  font-medium mb-2">Parse Your Data Files</h2>
				<p className="text-gray-400 text-sm mb-4">Upload files or folders to start parsing</p>
			</div>
			<div className="w-[600px] h-[260px]  text-white flex items-center justify-center border-dashed border-2 border-gray-800 rounded-lg">
				<div>
					<div className="flex items-center justify-center pb-10 flex-col">
						<InputIcon />
					</div>
					<div className="inline-flex items-center flex-row rounded-lg overflow-hidden border border-gray-700">
						<button
							onClick={handleFileSelect}
							className="bg-transparent items-center flex gap-2 hover:bg-gray-800 text-gray-200 px-4 py-3 text-sm font-medium transition-colors"
						>
							<FileIcon />
							<span>Select Files</span>
						</button>

						<div className="flex items-center rounded-lg px-4 py-1 text-gray-500 bg-gray-800/60">
							<span className="text-sm font-medium">OR</span>
						</div>
						<button
							onClick={handleFolderSelect}
							className="min-w-36 bg-transparent items-center flex gap-2 hover:bg-gray-800 text-gray-200 px-4 py-3 text-sm font-medium transition-colors"
						>
							<FolderIcon />
							<span>Select Folder</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
export default DragAndDrop;
