import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLoyaout';
import { invoke } from '@tauri-apps/api/core';

import MainPage from './routes/MainPage';
import SavedFilesPage from './routes/SavedFilesPage';
import { ToastProvider } from './context/ToastContext';

export default function App() {
	const [savedFiles, setSavedFiles] = useState<string[]>([]);

	const reloadFiles = async () => {
		const res = await invoke('get_files');
		setSavedFiles(res);
	};

	useEffect(() => {
		reloadFiles();
	}, []);

	return (
		<ToastProvider>
			<BrowserRouter>
				<Routes>
					<Route element={<RootLayout />}>
						<Route path="/" element={<MainPage reloadFiles={reloadFiles} />} />
						<Route
							path="/saved-files"
							element={<SavedFilesPage savedFiles={savedFiles} reloadFiles={reloadFiles} />}
						/>
					</Route>
				</Routes>
			</BrowserRouter>
		</ToastProvider>
	);
}
