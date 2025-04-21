import { CopyIcon } from '../icons';
import { AnimatePresence, motion } from 'framer-motion';
import { backdropVariants, modalVariants } from '../animation/modal';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	content: string;
	fileName: string;
	onSave: ({ editText: string }) => void;
	onCopy: (content: string) => void;
	isCopied: boolean;
	onEdit: (content: string) => void;
};

const EditModal = ({
	isOpen,
	onClose,
	content,
	fileName,
	onSave,
	onCopy,
	isCopied,
	onEdit
}: Props) => {
	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					variants={backdropVariants}
					initial="initial"
					animate="animate"
					exit="exit"
					className="fixed z-10 inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center"
					onClick={onClose}
				>
					<motion.div
						variants={modalVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						style={{ perspective: '1000px' }}
						onClick={(e) => e.stopPropagation()}
						className="w-full max-w-3xl h-2/3 flex flex-col rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#121212] transition-colors"
					>
						<div className="h-14 bg-gray-100 dark:bg-slate-950 items-center flex justify-between rounded-t-xl px-4 border-b border-gray-200 dark:border-gray-700">
							<h2 className="text-sm text-black/60 dark:text-white/60 leading-none">{fileName}</h2>
							<button
								className="text-black/60 dark:text-white/60 text-lg hover:text-black dark:hover:text-white transition"
								onClick={onClose}
							>
								✕
							</button>
						</div>

						<div className="flex-grow bg-gray-50 dark:bg-slate-900 p-4 overflow-auto rounded-md">
							<textarea
								onChange={(e) => onEdit(e.target.value)}
								value={content}
								className="w-full h-full resize-none bg-transparent text-sm font-mono text-black/80 dark:text-white/80 focus:outline-none"
							/>
						</div>

						<div className="h-14 bg-gray-100 dark:bg-slate-950 flex items-center justify-between px-4 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
							<button
								className={`text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 ${
									isCopied ? 'text-green-600 dark:text-green-400' : ''
								}`}
								onClick={() => onCopy(content)}
								title="Copy content"
							>
								{isCopied ? (
									<span className="text-xs text-green-600 dark:text-green-400">Copied!</span>
								) : (
									<>
										<CopyIcon />
										<span className="text-xs">Copy</span>
									</>
								)}
							</button>
							<button
								className="text-white bg-black dark:bg-white dark:text-black text-sm rounded-md py-2 px-4 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
								onClick={() => onSave({ editText: content })}
							>
								Saved
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default EditModal;
