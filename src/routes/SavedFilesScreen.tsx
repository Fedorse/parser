import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '../hooks/useToast';
import { ListFiles } from '../components/ListFiles';
import EditModal from '../components/EditModal';

export type FilePreview = {
	name: string;
	path: string;
	preview: string;
	size: number;
};

type OpenFile = {
	fileName: string;
	filePath: string;
	content: string;
} | null;

const SavedFilesScreen = () => {
	const { success } = useToast();
	const [files, setFiles] = useState<FilePreview[]>([]);
	const [openFile, setOpenFile] = useState<OpenFile>(null);
	const [isCopied, setIsCopied] = useState(false);

	const handleOpenFile = async (file: FilePreview) => {
		try {
			const content = await invoke<string>('get_file_content', { filePath: file.path });
			setOpenFile({ fileName: file.name, filePath: file.path, content: content });
		} catch (err) {
			console.error('Failed to load files:', err);
		}
	};

	const fetchFiles = async () => {
		try {
			const files = await invoke<FilePreview[]>('get_files');
			setFiles(files);
		} catch (err) {
			console.error('Failed to load files:', err);
		}
	};

	const handleCopy = async (content: string) => {
		await navigator.clipboard.writeText(openFile.content);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	const deleteByPath = (pathName: string) => {
		setFiles((prev) => prev.filter((file) => file.path !== pathName));
	};

	const updateFileContnet = (text: string) => {
		setOpenFile((prev) => ({ ...prev, content: text }));
	};

	const handleSave = async ({ editText }: { editText: string }) => {
		try {
			await invoke('update_file', {
				filePath: openFile.filePath,
				content: editText
			});
			setOpenFile({ ...openFile, content: editText });
			await fetchFiles();
			setOpenFile(null);
			success('File saved successfully');
		} catch (err) {
			console.error('Failed to save file:', err);
		}
	};

	const handleRenameFile = async (path: string, newName: string) => {
		try {
			await invoke('rename_file', {
				filePath: path,
				newName: newName
			});
			setFiles((prev) =>
				prev.map((file) => (file.path === path ? { ...file, name: newName } : file))
			);
		} catch (err) {
			console.error('Failed to rename file:', err);
		}
	};

	useEffect(() => {
		fetchFiles();
	}, []);

	return (
		<div className="flex flex-col items-center justify-center">
			<ListFiles
				savedFiles={files}
				onOpen={handleOpenFile}
				handleDelete={deleteByPath}
				onRename={handleRenameFile}
			/>
			<EditModal
				isOpen={!!openFile}
				isCopied={isCopied}
				onClose={() => setOpenFile(null)}
				content={openFile?.content}
				fileName={openFile?.fileName}
				onCopy={handleCopy}
				onSave={handleSave}
				onEdit={updateFileContnet}
			/>
		</div>
	);
};
export default SavedFilesScreen;
