import FileInput from './FileInput';
export const DragAndDrop = ({ onFolderSelected }: any) => {
	return (
		<div className="flex rounded-2xl w-[450px] h-[290px] bg-gray-900 p-6 border border-gray-800">
			<div className="flex bg-black flex-col items-center justify-center w-full h-full border-2 border-gray-800 border-dashed rounded-2xl">
				<FileInput onFolderSelected={onFolderSelected} />
			</div>
		</div>
	);
};
export default DragAndDrop;