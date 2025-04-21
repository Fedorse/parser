export const variants = {
	initial: { opacity: 0, y: 50, scale: 0.3, filter: 'blur(8px)' },
	animate: {
		opacity: 1,
		y: 0,
		scale: 1,
		filter: 'blur(0px)',
		transition: { duration: 0.4, ease: 'easeOut' }
	},
	exit: {
		opacity: 0,
		y: 50,
		scale: 0.1,
		filter: 'blur(8px)',
		transition: { duration: 0.2, ease: 'easeIn' }
	}
};
