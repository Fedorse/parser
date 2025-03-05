import DragAndDrop from '../components/DragAndDrop';

export const MainPage = ({ handleFolderSelect, handleFileSelect }) => {
	return (
		<main className="h-screen flex flex-col items-center justify-center ">
			<DragAndDrop handleFileSelect={handleFileSelect} handleFolderSelect={handleFolderSelect} />
		</main>
	);
};
export default MainPage;
