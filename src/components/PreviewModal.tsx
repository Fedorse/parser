import { useState, useEffect } from 'react';
import { CopyIcon } from '../icons';

const PreviewModal = ({ isOpen, onClose, initContent, fileName, onSave, onCopy, isCopied }) => {
	const [editContent, setEditContent] = useState('');

	useEffect(() => {
		if (initContent) {
			setEditContent(initContent);
		}
	}, [initContent]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed z-10 inset-0 bg-black/60 backdrop-blur-sm transition-opacity flex flex-col items-center justify-center motion-preset-expand"
			onClick={onClose}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="w-2/3 h-2/3 flex flex-col rounded-xl border border-gray-600"
			>
				<div className="h-14 bg-[#121212] items-center flex justify-between rounded-t-xl px-4">
					<h2 className="text-sm text-white/60 leading-none">{fileName}</h2>
					<button className="text-white/60 text-lg hover:text-white" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="flex-grow bg-[#282c34] p-4 overflow-auto rounded-md">
					<textarea
						onChange={(e) => setEditContent(e.target.value)}
						value={editContent}
						className="w-full h-full resize-none bg-transparent text-sm font-mono text-white/80 focus:outline-none"
					/>
				</div>

				<div className="h-14 bg-[#121212] flex items-center justify-between px-4 rounded-b-xl">
					<button
						className={`text-white/70 hover:text-white transition-colors flex items-center gap-1 ${
							isCopied ? 'text-green-500' : ''
						}`}
						onClick={() => onCopy(editContent)}
						title="Copy content"
					>
						{isCopied ? (
							<span className="text-xs text-green-500">Copied!</span>
						) : (
							<>
								<CopyIcon />
								<span className="text-xs">Copy</span>
							</>
						)}
					</button>
					<button
						className="text-black text-sm rounded-md py-2 px-4 bg-white hover:bg-gray-200 transition-colors"
						onClick={() => onSave({ editContent })}
					>
						Saved
					</button>
				</div>
			</div>
		</div>
	);
};

export default PreviewModal;
