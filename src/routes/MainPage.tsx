import DragAndDrop from '../components/DragAndDrop';

export const MainPage = ({ handleFolderSelect, handleFileSelect }) => {
	return (
		<main className="h-screen w-screen flex flex-col items-center justify-center gap-5">
			<DragAndDrop handleFileSelect={handleFileSelect} handleFolderSelect={handleFolderSelect} />
		</main>
	);
};
export default MainPage;
