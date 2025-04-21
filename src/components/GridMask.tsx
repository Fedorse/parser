type Props = {
	isDragging: boolean;
};
export const GridMask = ({ isDragging }: Props) => {
	const columns = 41;
	const rows = 11;
	return (
		<div className="flex dark:bg-gray-600 bg-white flex-shrink-0 flex-wrap  justify-center items-center gap-x-px gap-y-px scale-105">
			{Array.from({ length: rows }).map((_, row) =>
				Array.from({ length: columns }).map((_, col) => {
					const index = row * columns + col;
					return (
						<div
							key={`${col}-${row}`}
							className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
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
