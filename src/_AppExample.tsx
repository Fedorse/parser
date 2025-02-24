import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import Navbar from './components/newDesign/Navbar';
import DragAndDrop from './components/newDesign/DragAndDrop';
import ListFiles from './components/newDesign/ListFiles';

export default function FileUploader() {
	const [savedFiles, setSavedFiles] = useState<string[]>([]);
	const [currentFile, setCurrentFile] = useState<string>('');

	const reloadFiles = async () => {
		const res = await invoke('get_files');

		setSavedFiles(res);
	};

	const handleFileClick = async (path: string) => {
		const content = await invoke('get_file_content', { filePath: path });
		setCurrentFile(content);
	};

	const handleFileRemove = async (path) => {
		await invoke('remove_file', { filePath: path });
		await reloadFiles();
	};

	const parseFiles = async (files) => {
		await invoke('parse_files', {
			filePaths: files,
			title: 'Test'
		});

		await reloadFiles();
	};

	const handleFileSelect = async () => {
		const selected = await open({
			multiple: true,
			filters: [{ name: 'Text', extensions: ['txt', 'log', 'md'] }]
		});

		let files;

		if (Array.isArray(selected)) {
			files = selected;
		} else if (selected) {
			files = selected;
		}

		await parseFiles(files);
	};
	const handleFolderSelect = async () => {
		const selected = await open({
			multiple: true,
			directory: true,
			filters: [{ name: 'Text', extensions: ['txt', 'log', 'md'] }]
		});
		let files;

		if (Array.isArray(selected)) {
			files = selected;
		} else if (selected) {
			files = selected;
		}

		await parseFiles(files);
	};

	useEffect(() => {
		reloadFiles();
	}, []);

	return (
		<>
			<Navbar />
			<main className="bg-black h-screen w-screen flex flex-col items-center justify-center gap-5">
				<DragAndDrop handleFileSelect={handleFileSelect} handleFolderSelect={handleFolderSelect} />
				{/* <ListFiles /> */}
				<div className="p-2 border-[1px] border-gray-800 w-[600px] rounded-lg">
					<div className="flex flex-col items-center justify-center ">
						{savedFiles.map((filePath, index) => (
							<div
								onClick={() => handleFileClick(filePath)}
								className={`mt-4 text-md text-gray-400 cursor-pointer gap-10 w-full flex justify-center items-center ${
									index !== savedFiles.length - 1 ? 'border-b-[1px] border-gray-800' : ''
								}`}
								key={filePath}
							>
								<span className="text-ellipsis ">{filePath}</span>
								<span
									className="text-red-600 text-lg"
									onClick={(e) => {
										e.stopPropagation();
										handleFileRemove(filePath);
									}}
								>
									delete
								</span>
							</div>
						))}

						{currentFile && (
							<div className="mt-4 text-sm text-white gap-10">
								<span>{currentFile}</span>
							</div>
						)}
					</div>
				</div>
			</main>
		</>
	);
}
