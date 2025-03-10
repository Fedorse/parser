import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLoyaout';
import { invoke } from '@tauri-apps/api/core';

import MainPage from './routes/MainPage';
import SavedFilesPage from './routes/SavedFilesPage';

export default function App() {
	const [savedFiles, setSavedFiles] = useState<string[]>([]);

	const reloadFiles = async () => {
		const res = await invoke('get_files');
		setSavedFiles(res);
	};

	const parseFiles = async (files) => {
		await invoke('parse', {
			paths: files,
			ignorePatterns: []
		});

		await reloadFiles();
	};

	useEffect(() => {
		reloadFiles();
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route element={<RootLayout />}>
					<Route path="/" element={<MainPage parseFiles={parseFiles} />} />
					<Route
						path="/saved-files"
						element={<SavedFilesPage savedFiles={savedFiles} reloadFiles={reloadFiles} />}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
