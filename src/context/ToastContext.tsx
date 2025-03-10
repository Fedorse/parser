import { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
	const [toast, setToast] = useState([]);

	const showToast = ({ message, type = 'success', duration = '3000' }) => {
		const id = Date.now();

		setToast((prevToast) => [...prevToast, { id, message, type, duration }]);

		return id;
	};

	const hideToast = (id) => {
		setToast((prevToast) => prevToast.filter((toast) => toast.id !== id));
	};

	const success = (message, duration) => showToast({ message, type: 'success', duration });

	const contextValue = {
		showToast,
		hideToast,
		success
	};
	return (
		<ToastContext.Provider value={contextValue}>
			{children}
			<div className="fixed bottom-4 right-4 z-50">
				{toast.map((toast) => (
					<Toast
						key={toast.id}
						message={toast.message}
						type={toast.type}
						duration={toast.duration}
						onClose={() => hideToast(toast.id)}
					/>
				))}
			</div>
		</ToastContext.Provider>
	);
};
