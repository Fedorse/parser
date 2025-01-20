const Button = ({ children, onClick, className = '' }: any) => {
	return (
		<button onClick={onClick} className={`${className}`}>
			{children}
		</button>
	);
};

export default Button;
