import { AnimatePresence, motion } from 'framer-motion';
import { cardVariants } from '../animation/card';
import Card from './Card';

export const ListFiles = ({ savedFiles, onOpen, handleDelete, onRename }) => {
	return (
		<div className="gap-2 flex flex-col sm:p-10 p-2 ">
			{savedFiles.length > 0 && (
				<>
					<motion.h3
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						className="text-2xl font-light dark:text-white text-black  "
					>
						Saved Files
					</motion.h3>
					<motion.p
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.2 }}
						className="text-base font-light dark:text-white/70 text-black/80 "
					>
						Your saved files are ready to use. Click on any files to wiew or edit its contents.{' '}
					</motion.p>
				</>
			)}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-5 ">
				<AnimatePresence>
					{savedFiles && savedFiles.length > 0 ? (
						savedFiles.map((file, index) => (
							<motion.div
								key={file.path}
								variants={cardVariants}
								initial="initial"
								animate="animate"
								exit="exit"
								transition={{ duration: 0.3, delay: index * 0.03 }}
							>
								<Card
									onDelete={() => handleDelete(file.path)}
									{...file}
									key={file.path}
									onOpen={() => onOpen(file)}
									onRename={onRename}
								/>
							</motion.div>
						))
					) : (
						<p className="text-white text-2xl col-span-full text-center">No saved files</p>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default ListFiles;
