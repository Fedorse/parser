import Card from './Card';

export const ListFiles = ({ savedFiles, reloadFiles, handleFileRemove }) => {
	return (
		<div className=" px-4 py-8">
			<h2 className="text-3xl font-bold text-white mb-6">Saved Files</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{savedFiles && savedFiles.length > 0 ? (
					savedFiles.map((fileName) => (
						<Card
							key={fileName}
							fileName={fileName}
							reloadFiles={reloadFiles}
							handleFileRemove={handleFileRemove}
						/>
					))
				) : (
					<p className="text-gray-400 col-span-full text-center">No have save files</p>
				)}
			</div>
		</div>
	);
};

export default ListFiles;
