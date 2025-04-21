import { useState } from 'react';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { usePreset } from '../hooks/usePresset';
import { PresetForm } from '../components/PresetForm';
import { PresetList } from '../components/PresetList';
import { ArrowUp, ArrowDown, UploadIcon } from '../icons';
import { GridMask } from '../components/GridMask';
import { useClickOutside } from '../hooks/useClickOutside';
import { AnimatePresence, motion } from 'framer-motion';
import { variants } from '../animation/seletct';

type Props = {
	parse: (selected: string[]) => void;
};

export const DragAndDrop = ({ parse }: Props) => {
	const [open, setOpen] = useState(false);

	const { presets, selected, setSelected, form, setForm, savePreset, deletePreset, toggleForm } =
		usePreset();
	const { isDragging } = useDragAndDrop(parse);

	useClickOutside({ targetClass: 'select-menu', cb: () => setOpen(false) });

	return (
		<div className="w-full max-w-3xl  relative">
			<div
				className={`w-full min-h-[300px] sm:min-h-[400px] dark:text-white text-black border-t-[1px] 
					border-l-[1px] border-r-[1px]  shadow-md rounded-t-lg  transition-colors duration-300 
        ${
					isDragging
						? 'dark:border-blue-600 border-blue-500 border'
						: 'dark:border-gray-600/50 border-gray-300'
				}`}
			>
				<div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none">
					<GridMask isDragging={isDragging} />
				</div>
				<div className="z-50 relative select-menu inline-block">
					<button
						onClick={(e) => {
							e.stopPropagation();
							setOpen(!open);
						}}
						className={`flex flex-col dark:hover:bg-gray-800 hover:bg-gray-300  dark:text-white text-black rounded-md px-4 py-2 
							${open ? 'bg-gray-300 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}
						}`}
					>
						<div className="flex items-center gap-2">
							Preset {open ? <ArrowDown /> : <ArrowUp />}
						</div>
						<span className="text-xs text-black/60 dark:text-white/60">
							{selected || 'No preset'}
						</span>
					</button>
					<AnimatePresence>
						{open && (
							<motion.div
								initial="initial"
								animate="animate"
								exit="exit"
								variants={variants}
								className="absolute left-0 top-full mt-2 w-[90vw] max-w-[300px]  dark:bg-gray-900  bg-white  border dark:border-slate-600  rounded-md shadow-lg z-50 p-4"
							>
								<PresetForm
									form={form}
									onSave={savePreset}
									onToggle={toggleForm}
									setForm={setForm}
								/>
								<PresetList
									presets={presets}
									setSelected={setSelected}
									selected={selected}
									onDelete={deletePreset}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<div className=" flex flex-col items-center justify-center gap-6 mt-4 sm:mt-10 z-10">
					<div
						className={`relative dark:bg-white/20 bg-white shadow-lg flex items-center justify-center h-28 w-28 sm:h-32 sm:w-32 rounded-md transition-all duration-300 ease-out 
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

					<div className="text-center z-10">
						<h2 className="text-xl dark:text-white text-black font-medium">
							Drag and drop files here
						</h2>
						<div className="flex items-center justify-center gap-4">
							<div className="h-px bg-gray-300 dark:bg-gray-600 my-1 w-16 "></div>

							<div className="h-px bg-gray-300 dark:bg-gray-600 my-1 w-16 "></div>
						</div>
						<p className="text-gray-400"> use the buttons below</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DragAndDrop;
