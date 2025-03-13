import { invoke } from '@tauri-apps/api/core';
import { DeleteIcon, CopyIcon } from '../icons';

const Card = ({ fileName, reloadFiles, handleModalOpen, onCopy, isCopied, data }) => {
	const handleFileRemove = async (fileName) => {
		await invoke('remove_file', { fileName });
		reloadFiles();
	};

	const handleCopyClick = async (e) => {
		e.stopPropagation();
		onCopy(data[fileName]);
	};

	return (
		<>
			<div
				onClick={handleModalOpen}
				className="border-[1px] bg-[#121212] w-72 h-96  border-gray-600 rounded-t-2xl rounded-bl-2xl rounded-br-sm  flex flex-col cursor-pointer hover:border-blue-600 transition-colors motion-preset-rebound-right"
			>
				<div className="p-2 border-b border-gray-800/60 flex flex-col items-center">
					<h3 className="text-white text-base font-light max-w-full mb-1">{fileName}</h3>
					<span className="text-white/50 text-xs">Last edited 14 minutes ago</span>
				</div>

				<div className="p-3 flex-grow overflow-hidden">
					<div className="text-white/70 text-xs font-mono line-clamp-[15] overflow-hidden">
						{data[fileName]}
					</div>
				</div>

				<div className="p-3 flex w-full justify-between items-center border-t border-gray-800">
					<div className="flex gap-4 items-center">
						<button
							className={`text-white/70 hover:text-white transition-colors flex items-center gap-1 ${
								isCopied ? 'text-green-500' : ''
							}`}
							onClick={handleCopyClick}
							title="Copy content"
						>
							{isCopied ? (
								<span className="text-xs text-green-500">Copied!</span>
							) : (
								<>
									<CopyIcon />
									<span className="text-xs">Copy</span>
								</>
							)}
						</button>
					</div>

					<div className="flex gap-4 items-center">
						<span className="text-white/70 text-xs">24 KB</span>
						<button
							className="text-red-500/90 flex self-end hover:text-red-400 transition-colors"
							onClick={(e) => {
								e.stopPropagation();
								handleFileRemove(fileName);
							}}
						>
							<DeleteIcon />
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default Card;
