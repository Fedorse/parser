export const variants = {
	initial: { opacity: 0, y: -50, rotateX: -50, transformOrigin: 'top center' },
	animate: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.3, ease: 'easeOut' } },
	exit: { opacity: 0, rotateX: -20, transtion: { duration: 0.1, ease: 'easeIn' } }
};

export const formVariants = {
	initial: { opacity: 0, height: 0 },
	animate: { opacity: 1, height: 'auto', transition: { duration: 0.2, ease: 'easeInOut' } },
	exit: { opacity: 0, height: 0, transtion: { duration: 0.1, ease: 'easeOut' } }
};

export const variantsItem = {
	initial: { opacity: 0, y: -5, scale: 0.95 },
	animate: { opacity: 1, y: 0, scale: 1 },
	exit: { opacity: 0, y: -5, scale: 0.9 }
};
