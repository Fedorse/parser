import { createContext, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
	const [toast, setToast] = useState([]);

	const showToast = ({ message, type = 'success', duration = '3000' }) => {
		const id = `${Date.now()}-${Math.random()}`;

		setToast((prev) => [...prev, { id, message, type, duration }]);

		return id;
	};

	const hideToast = (id) => {
		setToast((prevToast) => prevToast.filter((toast) => toast.id !== id));
	};

	const success = (message, duration) => showToast({ message, type: 'success', duration });
	const error = (message, duration) => showToast({ message, type: 'error', duration });
	const info = (message, duration) => showToast({ message, type: 'info', duration });

	const contextValue = {
		showToast,
		hideToast,
		success,
		error,
		info
	};
	return (
		<ToastContext.Provider value={contextValue}>
			{children}
			<div>
				<AnimatePresence>
					{toast.map((toast) => (
						<Toast
							key={toast.id}
							message={toast.message}
							type={toast.type}
							duration={toast.duration}
							onClose={() => hideToast(toast.id)}
						/>
					))}
				</AnimatePresence>
			</div>
		</ToastContext.Provider>
	);
};
