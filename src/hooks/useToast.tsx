import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';
export const useToast = () => {
	const context = useContext(ToastContext);
	return context;
};
