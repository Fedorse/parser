const Card = ({ code, onClick }) => {
	return (
		<div onClick={onClick} className="flex-1 mb-5">
			<div
				className="h-64 w-52 p-4 rounded-3xl 
		  bg-gray-950 border border-gray-800
		  drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]
		  hover:scale-105
		  hover:border-blue-700/50
		  transition-all duration-500
		  rounded-tr-md"
			>
				<code className="text-xs text-gray-300 ">
					{code.length > 100 ? code.slice(0, 200) + '...' : code}
				</code>
			</div>
		</div>
	);
};

export default Card;
