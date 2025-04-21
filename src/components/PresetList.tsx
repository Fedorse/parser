import { DeleteIcon } from '../icons';
import { AnimatePresence, motion } from 'framer-motion';
import { variantsItem } from '../animation/seletct';

type Props = {
	presets: { [key: string]: string[] };
	setSelected: (s: any) => void;
	selected: string | null;
	onDelete: (name: string) => void;
};

export const PresetList = ({ presets, setSelected, selected, onDelete }: Props) => {
	return (
		<div className="max-h-64  overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-500/20 scrollbar-track-transparent">
			<AnimatePresence>
				{Object.entries(presets).map(([name, paterns]) => {
					const isActive = selected === name;
					return (
						<motion.div
							key={name}
							variants={variantsItem}
							initial="initial"
							animate="animate"
							exit="exit"
							transition={{ duration: 0.25 }}
							onClick={(e) => {
								e.stopPropagation();
								setSelected(isActive ? null : name);
							}}
							className="flex justify-between pr-3"
						>
							<div className="flex flex-col mt-2 cursor-pointer group transition-colors max-w-full">
								<span className={` ${isActive ? 'text-blue-600' : 'group-hover:text-blue-600'}`}>
									{name}
								</span>
								<span
									className={`text-xs  truncate max-w-full ${
										isActive
											? 'dark:text-white text-black'
											: 'dark:text-white/50 text-black/50 group-hover:text-black dark:group-hover:text-white'
									} `}
								>
									{paterns.join(', ')}
								</span>
							</div>

							{isActive ? (
								<span className="text-blue-500 flex self-end">✓</span>
							) : (
								<button className="text-red-400 flex self-end " onClick={() => onDelete(name)}>
									<DeleteIcon className="w-4 h-4" />
								</button>
							)}
						</motion.div>
					);
				})}
			</AnimatePresence>
		</div>
	);
};
