import { motion, AnimatePresence } from 'framer-motion';
import { formVariants } from '../animation/seletct';
type Props = {
	form: {
		isOpen: boolean;
		name: string;
		patterns: string;
	};

	onSave: () => void;
	onToggle: () => void;
	setForm: (form: any) => void;
};

export const PresetForm = ({ form, onSave, onToggle, setForm }: Props) => {
	return (
		<>
			<div
				className={`text-sm gap-3 flex  border-b dark:border-slate-600 border-slate-200 w-full ${
					!form.isOpen ? '' : 'justify-between text-white'
				}`}
				onClick={onToggle}
			>
				<span className="text-base cursor-pointer dark:hover:text-white hover:text-black  text-black dark:text-white">
					Add new preset
				</span>
				{form.isOpen ? (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onSave();
						}}
						className="dark:text-black/80  dark:bg-white bg-black text-white  text-sm mb-3 px-3 flex  py-1 border border-slate-600  rounded-md"
					>
						Saved
					</button>
				) : (
					<span className="mb-4 dark:bg-gray-800 bg-gray-200 text-black w-5 h-5 rounded-full flex items-center justify-center dark:text-white">
						+
					</span>
				)}
			</div>
			<AnimatePresence>
				{form.isOpen && (
					<motion.div
						key="preset-form"
						variants={formVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						className="flex flex-col gap-2 mt-2"
					>
						<label htmlFor="preset-name" className="text-xs">
							Preset name
						</label>
						<input
							id="preset-name"
							type="text"
							value={form.name}
							onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									onSave();
								}
							}}
							placeholder="Enter preset name"
							className="dark:bg-slate-800 outline-none  focus:ring-2   bg-slate-200 px-2 py-1 rounded dark:text-white text-black placeholder-transparent text-sm dark:focus:placeholder-white/50 focus:placeholder-black/50 transition-colors"
						/>

						<label htmlFor="preset-patterns" className="text-xs ">
							Files to exclude, comma separated
						</label>
						<input
							id="preset-patterns"
							value={form.patterns}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									onSave();
								}
							}}
							placeholder="Comma-separated patterns (e.g. node_modules, .git)"
							onChange={(e) => setForm((prev) => ({ ...prev, patterns: e.target.value }))}
							className="dark:bg-slate-800 outline-none  focus:ring-2   bg-slate-200 px-2 py-1 rounded dark:text-white text-black placeholder-transparent text-sm dark:focus:placeholder-white/50 focus:placeholder-black/50 transition-colors mb-4"
						></input>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};
