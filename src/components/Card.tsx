const Card = ({ code, onClick }: any) => {
	return (
		<div onClick={onClick} className="flex-1 bbg-gray-50 rounded-3xl shadow-2xl w-52 p-4 h-64 my-5">
			<code className="text-xs font-mono  text-gray-700">
				{code.length > 100 ? code.slice(0, 200) + '...' : code}
			</code>
		</div>
	);
};
export default Card;
