import { useState, useEffect } from 'react';
import { DeleteIcon } from '../icons/DeleteIcon';
import PreviewModal from './PreviewModal';
import { invoke } from '@tauri-apps/api/core';

const Card = ({ fileName, reloadFiles, handleFileRemove }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [localContent, setLocalContent] = useState('');

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
				className="border-[1px] w-72 h-52 bg-neutral-950 border-gray-600 rounded-lg  flex flex-col cursor-pointer hover:border-white transition-colors"
			>
				<div className="p-3 border-b border-gray-700">
					<h3 className="text-white text-base font-medium max-w-full">{fileName}</h3>
				</div>

				<div className="p-3 flex-grow overflow-hidden">
					<div className="text-gray-400 text-xs font-mono line-clamp-5 overflow-hidden">
						{localContent}
					</div>
				</div>

				<div className="p-2 flex justify-end items-center border-t border-gray-700">
					<button
						className="text-red-500 hover:text-red-400 transition-colors"
						onClick={(e) => {
							e.stopPropagation();
							handleFileRemove(fileName);
						}}
					>
						<DeleteIcon />
					</button>
				</div>
			</div>

			<PreviewModal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				content={localContent}
				fileName={fileName}
				saveCurrentFile={handleSave}
			/>
		</>
	);
};

export default Card;
