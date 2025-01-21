export const PreviewModal = ({ isOpen, onClose, code }) => {
	if (!isOpen) return null;
	return (
		<div
			className="fixed z-50 inset-0 bg-black/50 flex flex-col items-center justify-center"
			onClick={onClose}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="bg-white relative rounded-lg p-4 w-[600px] max-h-[80vh] flex flex-col"
			>
				<h2>Code preview</h2>
				<div className="overflow-hidden flex-1">
					<pre className="bg-gray-50 p-4 rounded h-full overflow-y-auto ">
						<code className="text-sm font-mono ">{code}</code>
					</pre>
				</div>
			</div>
		</div>
	);
};
export default PreviewModal;
