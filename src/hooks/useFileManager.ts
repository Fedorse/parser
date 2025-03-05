import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

export const useFileManager = () => {
	const [saveFiles, setSaveFiles] = useState<string[]>([]);
	const [currentFile, setCurrentFile] = useState<string>('');
	const [currentFileContent, setCurrentFileContent] = useState<string>('');

	const saveCurrentFile = async () => {
		await invoke('update_file', {
			fileName: currentFile,
			content: currentFileContent
		});
	};
	const reloadFiles = async () => {
		const res = await invoke('get_files');
		setSaveFiles(res);
	};

	const handleFileClick = async (fileName: string) => {
		const content = await invoke('get_file_content', { fileName });
		setCurrentFile(fileName);
		setCurrentFileContent(content);
	};

	const handleFileRemove = async (fileName) => {
		await invoke('remove_file', { fileName });
		await reloadFiles();
	};

	const parseFiles = async (files) => {
		await invoke('parse_files', {
			filePaths: files,
			title: 'files1test'
		});
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
	}, [reloadFiles]);

	return {
		currentFile,
		currentFileContent,
		saveFiles,

		setCurrentFileContent,

		saveCurrentFile,
		reloadFiles,
		handleFileClick,
		handleFileRemove,
		parseFiles,
		handleFileSelect,
		handleFolderSelect
	};
};
