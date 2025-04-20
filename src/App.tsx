import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import RootLayout from './layouts/RootLoyaout';
import MainScreen from './routes/MainScreen';
import SavedFilesScreen from './routes/SavedFilesScreen';

export default function App() {
	return (
		<ToastProvider>
			<BrowserRouter>
				<Routes>
					<Route element={<RootLayout />}>
						<Route path="/" element={<MainScreen />} />
						<Route path="/saved-files" element={<SavedFilesScreen />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</ToastProvider>
	);
}
