import { ListFiles } from '../components/ListFiles';

const SavedFilesPage = ({ reloadFiles, savedFiles }) => {
	return (
		<div className="flex flex-col items-center justify-center ">
			<ListFiles savedFiles={savedFiles} reloadFiles={reloadFiles} />
		</div>
	);
};
export default SavedFilesPage;
