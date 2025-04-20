import { invoke } from '@tauri-apps/api/core';
import { DeleteIcon, CopyIcon, OpenDocument, EditorIcon } from '../icons';
import { formatFileSize } from '../utils/formatFileSize.ts';
import { useState } from 'react';

const THIRTY_MB_SIZE = 30 * 1024 * 1024;

type Props = {
	name: string;
	size: number;
	path: string;
	onOpen: () => void;
	onCopy: (content: string) => void;
	isCopied: boolean;
	preview: string;
	onDelete: (path: string) => void;
	onRename: (path: string, newName: string) => void;
};

const Card = ({
	name,
	size,
	path,
	onOpen,
	onCopy,
	isCopied,
	preview,
	onDelete,
	onRename
}: Props) => {
	const [newName, setNewName] = useState<string>('');
	const [renamingFile, setRenamingFile] = useState<string | null>(null);

	const handleDeleteClick = async (path: string) => {
		try {
			await invoke('delete_file', { path: path });
			onDelete(path);
		} catch (err) {
			console.error('Failed to delete file:', err);
		}
	};

	const handleRenameClick = () => {
		if (newName && newName !== name) {
			onRename(path, newName);
		}
		setRenamingFile(null);
	};

	const handleCopyClick = async (e) => {
		e.stopPropagation();
		onCopy(path);
	};

	const handleOpenDir = async (path: string) => {
		try {
			await invoke('open_in_folder', { filePath: path });
		} catch (err) {
			console.error('Failed to open file:', err);
		}
	};

	const openInEditor = async (path: string) => {
		try {
			await invoke('open_in_default_editor', { filePath: path });
		} catch (err) {
			console.error('Failed to open file in editor:', err);
		}
	};

	return (
		<>
			<div
				onDoubleClick={() => {
					if (size > THIRTY_MB_SIZE) {
						openInEditor(path);
					} else {
						onOpen();
					}
				}}
				className=" w-full sm:w-72 max-w-xs h-96 border border-gray-300 dark:border-gray-600 
				dark:bg-slate-900 bg-white rounded-t-2xl rounded-bl-2xl rounded-br-sm 
				flex flex-col cursor-pointer hover:border-blue-600 transition-colors "
			>
				<div className="p-2 border-b border-gray-200 dark:border-gray-800/60 flex flex-col items-center">
					<h3 className="text-black dark:text-white text-base font-light max-w-full mb-1">
						{renamingFile === path ? (
							<input
								className="bg-white dark:bg-[#121212] text-black dark:text-white px-2 border border-gray-400 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
								autoFocus
								type="text"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								onBlur={() => handleRenameClick()}
								onKeyDown={(e) => {
									e.stopPropagation();
									if (e.key === 'Enter') handleRenameClick();
								}}
							/>
						) : (
							<div
								onClick={(e) => {
									e.stopPropagation();
									setNewName(name);
									setRenamingFile(path);
								}}
							>
								{name}
								<span className="dark:text-white/50 text-black/50 text-xs ml-2">Edit</span>
							</div>
						)}
					</h3>
				</div>

				<div className="p-3 flex-grow overflow-hidden relative">
					<div className="dark:text-white/70 text-black/70 text-xs font-mono line-clamp-[15] overflow-hidden select-none ">
						{preview}
					</div>
					<div
						className="absolute inset-0 dark:bg-slate-900 bg-white dark:text-white text-black text-base flex flex-col 
					justify-center items-center opacity-0 hover:opacity-100 transition-opacity  px-4 text-center"
					>
						<p className="mb-1 select-none">Double click to open</p>
						<EditorIcon />
					</div>
				</div>

				<div className="p-3 flex w-full justify-between items-center border-t border-gray-200 dark:border-gray-800">
					<div className="flex gap-4 items-center">
						<button
							className={`dark:text-white/70 text-black/70 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 ${
								isCopied ? 'text-green-500' : ''
							}`}
							onClick={handleCopyClick}
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
					</div>

					<div className="flex gap-3 items-center">
						<span className="dark:text-white/70 text-black/70 text-xs">{formatFileSize(size)}</span>

						<button
							className="text-sm text-black dark:text-white"
							onClick={(e) => {
								e.stopPropagation();
								handleOpenDir(path);
							}}
						>
							<OpenDocument />
						</button>
						<button
							className="text-red-600 dark:text-red-400 flex self-end hover:text-red-400 transition-colors"
							onClick={(e) => {
								e.stopPropagation();
								handleDeleteClick(path);
							}}
						>
							<DeleteIcon />
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default Card;
