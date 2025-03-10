import { useEffect } from 'react';
const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => {
			clearTimeout(timer);
		};
	}, [duration, onClose]);
	return <div className="fixed bottom-4 right-4 bg-white w-24 h-24 z-50">{message}</div>;
};

export default Toast;
