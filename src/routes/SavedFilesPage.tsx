import { ListFiles } from '../components/ListFiles';
import PreviewModal from '../components/PreviewModal';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
const SavedFilesPage = ({ reloadFiles, savedFiles }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentFile, setCurrentFile] = useState('');
	const [currentContent, setCurrentContent] = useState('');
	const [isCopied, setIsCopied] = useState(false);

	const handleModalOpen = (fileName, content) => {
		setCurrentFile(fileName);
		setCurrentContent(content);
		setIsModalOpen(true);
	};
	const handleCopy = async (content) => {
		await navigator.clipboard.writeText(content);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};
	const handleSave = async ({ newContent }) => {
		await invoke('update_file', {
			fileName: currentFile,
			content: newContent
		});
		setCurrentContent(newContent);
		setIsModalOpen(false);
	};

	return (
		<div className="flex flex-col items-center justify-center ">
			<ListFiles
				savedFiles={savedFiles}
				reloadFiles={reloadFiles}
				handleModalOpen={handleModalOpen}
				onCopy={handleCopy}
				isCopied={isCopied}
			/>
			<PreviewModal
				isOpen={isModalOpen}
				isCopied={isCopied}
				onClose={() => setIsModalOpen(false)}
				content={currentContent}
				fileName={currentFile}
				handleCopy={() => handleCopy(currentContent)}
				saveCurrentFile={handleSave}
			/>
		</div>
	);
};
export default SavedFilesPage;
