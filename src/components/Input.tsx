export const Input = ({ id, placeholder, label }) => {
	return (
		<div className="space-y-1">
			{label && (
				<label className="block text-sm font-medium text-gray-100 mb-1" htmlFor={id}>
					{label}
				</label>
			)}
			<input
				className={` bg-zinc-800 w-full px-4 py-2 rounded-lg border-gray-900 border outline-none focus:ring-2 focus:ring-blue-500`}
				type="text"
				placeholder={placeholder}
				id={id}
			/>
		</div>
	);
};
export default Input;
