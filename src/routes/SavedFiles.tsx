import { ListFiles } from '../components/ListFiles';

const SavedFiles = ({reloadFiles, savedFiles, handleFileRemove}) => {
	return (
		<div className="flex flex-col items-center justify-center">
			<ListFiles savedFiles={savedFiles} reloadFiles={reloadFiles} handleFileRemove={handleFileRemove} />
		</div>
	);
};
export default SavedFiles;
