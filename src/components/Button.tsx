const Button = ({ children, onClick, className = '', variant = 'default' }: any) => {
	const defaultClasses =
		variant === 'icon'
			? ''
			: 'border-none px-6 py-2 text-sm text-white rounded-full tracking-tight outline-none bg-blue-600 hover:bg-blue-800 transition-all';
	return (
		<button onClick={onClick} className={`${defaultClasses} ${className}`}>
			{children}
		</button>
	);
};

export default Button;
