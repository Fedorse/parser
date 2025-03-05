import { useState, useEffect } from 'react';
import PreviewModal from './PreviewModal';
import { invoke } from '@tauri-apps/api/core';
import { DeleteIcon, CopyIcon, EditIcon } from '../icons';

const Card = ({ fileName, reloadFiles, handleFileRemove }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [localContent, setLocalContent] = useState('');
	const [isCopied, setIsCopied] = useState(false);

	const loadContent = async () => {
		const content = await invoke('get_file_content', { fileName });
		return content;
	};

	const handleOpen = async () => {
		const content = await loadContent();
		setLocalContent(content);
		setIsOpen(true);
	};

	const handleSave = async ({ newContent }) => {
		await invoke('update_file', {
			fileName: fileName,
			content: newContent
		});

		setLocalContent(newContent);
		setIsOpen(false);
		if (reloadFiles) {
			reloadFiles();
		}
	};

	const handleCopy = async (e) => {
		e.stopPropagation();
		await navigator.clipboard.writeText(localContent);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	useEffect(() => {
		const loadInitialContent = async () => {
			const content = await loadContent();
			setLocalContent(content || '');
		};
		loadInitialContent();
	}, [fileName]);

	return (
		<>
			<div
				onClick={handleOpen}
				className="border-[1px] bg-[#121212] w-72 h-96  border-gray-600 rounded-t-2xl rounded-bl-2xl rounded-br-sm  flex flex-col cursor-pointer hover:border-blue-600 transition-colors motion-preset-rebound-right"
			>
				<div className="p-2 border-b border-gray-800/60 flex flex-col items-center">
					<h3 className="text-white text-base font-light max-w-full mb-1">{fileName}</h3>
					<span className="text-white/50 text-xs">Last edited 14 minutes ago</span>
				</div>

				<div className="p-3 flex-grow overflow-hidden">
					<div className="text-white/70 text-xs font-mono line-clamp-[15] overflow-hidden">
						{localContent}
					</div>
				</div>

				<div className="p-3 flex w-full justify-between items-center border-t border-gray-800">
					<div className="flex gap-4 items-center">
						<button
							className={`text-white/70 hover:text-white transition-colors flex items-center gap-1 ${
								isCopied ? 'text-green-500' : ''
							}`}
							onClick={handleCopy}
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
						{/* <button
							className="text-white/70 hover:text-white transition-colors flex items-center gap-1"
							onClick={handleOpen}
							title="Edit file"
						>
							<EditIcon />
							<span className="text-xs">Edit</span>
						</button> */}
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

			<PreviewModal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				content={localContent}
				fileName={fileName}
				saveCurrentFile={handleSave}
				handleCopy={handleCopy}
				isCopied={isCopied}
			/>
		</>
	);
};

export default Card;
