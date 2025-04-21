export const cardVariants = {
	initial: { opacity: 0, y: 20, scale: 0.8, filter: 'blur(10px)' },
	animate: {
		scale: 1,
		opacity: 1,
		y: 0,
		filter: 'blur(0px)'
	},
	exit: {
		opacity: 0,
		scale: 0.85,
		y: 10,
		transition: { duration: 0.2 }
	}
};
