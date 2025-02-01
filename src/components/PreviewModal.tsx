export const PreviewModal = ({ isOpen, onClose, code }: any) => {
	if (!isOpen) return null;
	return (
		<div
			className="fixed z-50 inset-0 bg-black/60 backdrop-blur-sm transition-opacity flex flex-col items-center justify-center"
			onClick={onClose}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="w-[600px]  max-h-[80vh] flex flex-col rounded-t-xl rounded-b-xl  border border-slate-800"
			>
				<div className="h-10 bg-slate-900 items-center flex rounded-t-xl  ">
					<h2 className=" text-sm text-gray-300 leading-none pl-4 ">Preview</h2>
				</div>
				<div className="overflow-hidden flex-1  ">
					<pre className="bg-[#282c34] p-4  h-full overflow-y-auto rounded-b-xl">
						<code className="text-sm font-mono text-gray-300 ">{code}</code>
					</pre>
				</div>
			</div>
		</div>
	);
};
export default PreviewModal;
