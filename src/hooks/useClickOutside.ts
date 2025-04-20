import { useEffect } from 'react';

type Props = {
	targetClass: string;
	cb: () => void;
};

export const useClickOutside = ({ targetClass, cb }: Props) => {
	useEffect(() => {
		const listener = (event: MouseEvent) => {
			const target = event.target as HTMLElement | null;
			if (target && !target.closest(`.${targetClass}`)) {
				cb();
			}
		};
		document.addEventListener('mousedown', listener);

		return () => {
			document.removeEventListener('mousedown', listener);
		};
	}, [targetClass, cb]);
};
