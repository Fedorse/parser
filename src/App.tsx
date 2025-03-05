import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLoyaout';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

import MainPage from './routes/MainPage';
import SavedFilesPage from './routes/SavedFilesPage';

export default function App() {
	const [savedFiles, setSavedFiles] = useState<string[]>([]);

	const reloadFiles = async () => {
		const res = await invoke('get_files');
		setSavedFiles(res);
	};

	const handleFileRemove = async (fileName) => {
		await invoke('remove_file', { fileName });
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

		if (!selected) return;

		const files = Array.isArray(selected) ? selected : [selected];
		await parseFiles(files);
	};

	const handleFolderSelect = async () => {
		const selected = await open({
			multiple: true,
			directory: true,
			filters: [{ name: 'Text', extensions: ['txt', 'log', 'md'] }]
		});

		if (!selected) return;

		const files = Array.isArray(selected) ? selected : [selected];
		await parseFiles(files);
	};

	useEffect(() => {
		reloadFiles();
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route element={<RootLayout />}>
					<Route
						path="/"
						element={
							<MainPage
								handleFileSelect={handleFileSelect}
								handleFolderSelect={handleFolderSelect}
							/>
						}
					/>
					<Route
						path="/saved-files"
						element={
							<SavedFilesPage
								savedFiles={savedFiles}
								handleFileRemove={handleFileRemove}
								reloadFiles={reloadFiles}
							/>
						}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
