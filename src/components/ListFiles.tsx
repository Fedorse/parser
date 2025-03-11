import Card from './Card';

export const ListFiles = ({ savedFiles, reloadFiles, handleModalOpen, onCopy, isCopied }) => {
	return (
		<div className="gap-2 flex flex-col p-10">
			{savedFiles.length > 0 && (
				<>
					<h3 className="text-2xl font-light dark:text-white text-black motion-opacity-in-0 motion-translate-z-in--50 motion-perspective-in motion-duration-700">
						Saved Files
					</h3>
					<p className="text-base font-light dark:text-white/70 text-black/80 motion-opacity-in-0 motion-translate-z-in--50 motion-perspective-in motion-duration-700 motion-delay-300">
						Your saved files are ready to use. Click on any files to wiew or edit its contents.{' '}
					</p>
				</>
			)}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-5">
				{savedFiles && savedFiles.length > 0 ? (
					savedFiles.map((fileName) => (
						<Card
							key={fileName}
							fileName={fileName}
							reloadFiles={reloadFiles}
							handleModalOpen={handleModalOpen}
							onCopy={onCopy}
							isCopied={isCopied}
						/>
					))
				) : (
					<p className="text-white text-2xl col-span-full text-center">No saved files</p>
				)}
			</div>
		</div>
	);
};

export default ListFiles;
