import { InputIcon } from '../icons/InputIcon';
export const FileInput = ({ onFolderSelected }) => {
	return (
		<>
			<input
				id="file-input"
				type="file"
				multiple
				webkitdirectory=""
				directory=""
				className="absolute inset-0 w-full h-full opacity-0"
				onChange={onFolderSelected}
			/>
			<InputIcon />
			<label htmlFor="file-input" className="text-gray-400 font-light leading-snug">
				Add files for Prompt
			</label>
		</>
	);
};
export default FileInput;
