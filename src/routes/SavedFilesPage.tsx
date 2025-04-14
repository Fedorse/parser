import { ListFiles } from '../components/ListFiles';
import PreviewModal from '../components/PreviewModal';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '../hooks/useToast';
const SavedFilesPage = () => {
	const [savedFiles, setSavedFiles] = useState<string[]>([]);
	const [savedAllData, setSavedAllDatа] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const { success } = useToast();

	const [isCopied, setIsCopied] = useState(false);
	const [modal, setModal] = useState({
		isOpen: false,
		content: '',
		fileName: ''
	});

	const loadAllFiles = async () => {
		const filesNames = await invoke('get_files');
		setSavedFiles(filesNames);

		const allData = {};

		for (const fileName of filesNames) {
			const content = await invoke('get_file_content', { fileName });
			allData[fileName] = content;
		}
		setSavedAllDatа(allData);
	};

	const handleModalOpen = (fileName) => {
		setModal({
			isOpen: true,
			content: savedAllData[fileName],
			fileName
		});
	};

	const modalClose = () => {
		setModal((prev) => ({
			...prev,
			isOpen: false
		}));
	};

	const handleCopy = async (content) => {
		await navigator.clipboard.writeText(content);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	const handleSave = async ({ editContent }) => {
		await invoke('update_file', {
			fileName: modal.fileName,
			content: editContent
		});
		setSavedAllDatа((prev) => ({
			...prev,
			[modal.fileName]: editContent
		}));
		success('File saved successfully');
		modalClose();
	};

	useEffect(() => {
		loadAllFiles();
	}, []);

	return (
		<div className="flex flex-col items-center justify-center">
			<ListFiles
				savedFiles={savedFiles}
				reloadFiles={loadAllFiles}
				handleModalOpen={handleModalOpen}
				onCopy={handleCopy}
				isCopied={isCopied}
				data={savedAllData}
			/>
			<PreviewModal
				isOpen={modal.isOpen}
				isCopied={isCopied}
				onClose={modalClose}
				initContent={modal.content}
				fileName={modal.fileName}
				onCopy={handleCopy}
				onSave={handleSave}
			/>
		</div>
	);
};
export default SavedFilesPage;
