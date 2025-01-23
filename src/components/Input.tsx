export const Input = ({ id, placeholder, label }) => {
	return (
		<div className="space-y-1">
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
					{label}
				</label>
			)}
			<input
				className="bg-gray-50 w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500"
				type="text"
				placeholder={placeholder}
				id={id}
			/>
		</div>
	);
};
export default Input;
