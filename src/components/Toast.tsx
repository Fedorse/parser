import { useEffect } from 'react';
import { CrossIcon } from '../icons/CrossIcon';
const SuccessIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-8 w-8"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
	</svg>
);

const ErrorIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-8 w-8"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
	</svg>
);

const InfoIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-8 w-8"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		/>
	</svg>
);

const Toast = ({ message, type, duration, onClose }) => {
	const styles = {
		success: {
			border: 'border-green-700',
			icon: 'text-green-700',
			bg: 'bg-gray-400',
			component: <SuccessIcon />
		},
		error: {
			border: 'border-red-700',
			icon: 'text-red-700',
			bg: 'bg-gray-400',
			component: <ErrorIcon />
		},
		info: {
			border: 'border-blue-700',
			icon: 'text-blue-700',
			bg: 'bg-gray-400',
			component: <InfoIcon />
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
		<div
			onClick={onClose}
			className={`fixed bottom-4 right-4 rounded-xl ${currentStyles.bg} font-light text-black flex w-64 h-20 z-50 overflow-hidden transition-colors duration-300 ease-out`}
		>
			<div className={`flex w-full p-4 gap-4 items-center border-l-4 ${currentStyles.border}`}>
				<div className={`${currentStyles.icon}`}>{currentStyles.component}</div>
				<p className="text-sm font-medium">{message}</p>
			</div>
			<button
				onClick={onClose}
				className="ml-2 text-black/80 flex justify-end items-start p-2 hover:to-black transition-colors"
			>
				<CrossIcon />
			</button>
		</div>
	);
};

export default Toast;
