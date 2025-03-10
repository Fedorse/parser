import { FolderIcon, FileIcon, UploadIcon } from '../icons';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

const GridPattern = ({ isDragging }) => {
	const columns = 41;
	const rows = 11;
	return (
		<div className="flex dark:bg-gray-500 bg-white flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
			{Array.from({ length: rows }).map((_, row) =>
				Array.from({ length: columns }).map((_, col) => {
					const index = row * columns + col;
					return (
						<div
							key={`${col}-${row}`}
							className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] transition-colors duration-300 ${
								isDragging
									? 'dark:bg-blue-800/30 bg-blue-200/40'
									: index % 2 === 0
									? 'dark:bg-gray-800/40 bg-gray-200/60'
									: 'dark:bg-gray-800/40 bg-gray-200/60 '
							}`}
						/>
					);
				})
			)}
		</div>
	);
};

export const DragAndDrop = ({ parseFiles }) => {
	const { isDragging } = useDragAndDrop(parseFiles);
	return (
		<div className="w-1/2 h-2/5 relative">
			{/* Добавлен relative для ограничения абсолютно позиционированных элементов */}
			<div
				className={`w-full h-full flex items-center justify-center dark:text-white text-black border-dashed border-[2px] shadow-md rounded-lg overflow-hidden transition-colors duration-300 
        ${
					isDragging
						? 'dark:border-blue-600 border-blue-500'
						: 'dark:border-gray-600/50 border-gray-300'
				}`}
			>
				{/* Ограничиваем маску паттерна контейнером с overflow:hidden */}
				<div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none">
					<GridPattern isDragging={isDragging} />
				</div>

				<div className="h-full flex flex-col items-center justify-center gap-10 z-10">
					<div
						className={`relative dark:bg-white/50 shadow-lg bg-white/90 flex items-center justify-center h-32 w-32 max-w-[8rem] rounded-md transition-all duration-300 ease-out 
            ${isDragging ? 'scale-75' : ''}`}
					>
						<div className="transition-opacity duration-300 ease-in-out">
							<UploadIcon />
							<div
								className={`absolute inset-0 rounded-md border-[1px] border-dashed border-blue-600 opacity-0 transition-opacity duration-300 scale-110 
                ${isDragging ? 'scale-125 opacity-100' : ''}`}
							></div>
						</div>
					</div>
					<div className="text-center">
						<h2 className="text-xl dark:text-white text-black font-medium">
							Drag and drop files here
						</h2>
						<div className="flex items-center justify-center gap-4">
							<div className="h-px bg-gray-300 dark:bg-gray-600 w-16 "></div>
							<span className="text-gray-500 dark:text-gray-400">or</span>
							<div className="h-px bg-gray-300 dark:bg-gray-600 w-16 "></div>
						</div>
						<p className="text-gray-400">select a file your computer</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DragAndDrop;
