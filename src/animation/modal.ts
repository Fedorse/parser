import { easeIn, easeInOut } from 'framer-motion';

export const backdropVariants = {
	initial: { opacity: 0 },
	animate: { opacity: 1, transition: { duration: 0.2, easeInOut } },
	exit: { opacity: 0, transition: { duration: 0.2, easeInOut } }
};

export const modalVariants = {
	initial: { opacity: 0, y: 100 },
	animate: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring', stiffness: 300, damping: 25 }
	},
	exit: {
		opacity: 0,
		y: 50,
		transition: { duration: 0.3, ease: 'easeIn' }
	}
};
