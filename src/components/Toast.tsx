import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { variants } from '../animation/toast';
import { SuccessIconToast, ErrorIconToast, InfoIconToast, CrossIcon } from '../icons';

type Props = {
	message: string;
	type: 'success' | 'error' | 'info';
	duration: number;
	onClose: () => void;
};

const Toast = ({ message, type, duration, onClose }: Props) => {
	const styles = {
		success: {
			border: 'border-green-700',
			icon: 'text-green-700',
			component: <SuccessIconToast />
		},
		error: {
			border: 'border-red-700',
			icon: 'text-red-700',
			component: <ErrorIconToast />
		},
		info: {
			border: 'border-blue-700',
			icon: 'text-blue-700',
			component: <InfoIconToast />
		}
	};
	const currentStyles = styles[type];

	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => {
			clearTimeout(timer);
		};
	}, [duration, onClose]);

	return (
		<motion.div
			initial="initial"
			animate="animate"
			exit="exit"
			variants={variants}
			onClick={onClose}
			className={`fixed bottom-4 right-4 rounded-xl dark:bg-slate-800 bg-slate-100 font-light dark:text-white text-black flex w-64 h-20 z-50 overflow-hidden transition-colors duration-300 ease-out`}
		>
			<div className={`flex w-full p-4 gap-4 items-center border-l-4 ${currentStyles.border}`}>
				<div className={`${currentStyles.icon}`}>{currentStyles.component}</div>
				<p className="text-sm font-medium">{message}</p>
			</div>
			<button
				onClick={onClose}
				className="ml-2 dark:text-white text-black flex justify-end items-start p-2 hover:to-black transition-colors"
			>
				<CrossIcon />
			</button>
		</motion.div>
	);
};

export default Toast;
