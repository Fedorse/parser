import { useState, useEffect } from 'react';
import Button from './Button';

const PreviewModal = ({ isOpen, onClose, content, fileName, saveCurrentFile }) => {
	const [editContent, setEditContent] = useState('');

	useEffect(() => {
		if (content) {
			setEditContent(content);
		}
	}, [content]);

	const handleSave = () => {
		saveCurrentFile({ newContent: editContent });
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed z-10 inset-0 bg-black/60 backdrop-blur-sm transition-opacity flex flex-col items-center justify-center"
			onClick={onClose}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="w-2/3 h-2/3 flex flex-col rounded-xl border border-slate-800"
			>
				<div className="h-14 bg-neutral-950 items-center flex justify-between rounded-t-xl px-4">
					<h2 className="text-sm text-gray-300 leading-none">{fileName}</h2>
					<button className="text-gray-400 hover:text-white" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="flex-grow bg-[#282c34] p-4 overflow-auto">
					<textarea
						onChange={(e) => setEditContent(e.target.value)}
						value={editContent}
						className="w-full h-full resize-none bg-transparent text-sm font-mono text-gray-300 focus:outline-none"
					/>
				</div>

				<div className="h-14 bg-neutral-950 flex items-center justify-end px-4 rounded-b-xl">
					<Button onClick={handleSave}>save</Button>
				</div>
			</div>
		</div>
	);
};

export default PreviewModal;
