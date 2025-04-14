import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLoyaout';

import MainPage from './routes/MainPage';
import SavedFilesPage from './routes/SavedFilesPage';
import { ToastProvider } from './context/ToastContext';

export default function App() {
	return (
		<ToastProvider>
			<BrowserRouter>
				<Routes>
					<Route element={<RootLayout />}>
						<Route path="/" element={<MainPage />} />
						<Route path="/saved-files" element={<SavedFilesPage />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</ToastProvider>
	);
}
