const Card = ({ code: code }: any) => (
	<div className="flex-1 bg-white rounded-3xl shadow-2xl w-52 p-4 h-64 my-5">
		<div className="text-xs font-mono  text-gray-700">{code}</div>
	</div>
);
export default Card;
