import DragAndDrop from '../components/DragAndDrop';
import GroupButtons from '../components/GroupButtons';

export const MainPage = ({ parseFiles }) => {
	return (
		<main className="h-full flex flex-col items-center justify-center ">
			<DragAndDrop parseFiles={parseFiles} />
			<GroupButtons parseFiles={parseFiles} />
		</main>
	);
};
export default MainPage;
