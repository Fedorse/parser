import { useState } from 'react';
import { OpenFolderIcon } from '../icons/OpenFolderIcon';
import { FolderIcon } from '../icons/FolderIcon';
import { TextFileIcon } from '../icons/TextFileIcon';
export const TreeNode = ({ node, selectedPaths, onToggle }) => {
	const [openFolder, setOpenFolder] = useState(false);

	const toggle = () => setOpenFolder((prev) => !prev);

	const isChecked = selectedPaths.includes(node.path);

	const handleCheck = (e) => {
		e.stopPropagation();
		onToggle(node.path);
	};

	return (
		<div className=" ">
			<div className="flex gap-2 items-center" onClick={toggle}>
				<input
					id="check"
					type="checkbox"
					checked={isChecked}
					onChange={handleCheck}
					className="w-3 h-3 rounded cursor-pointer border-gray-50 accent-blue-500"
				/>

				{node.isDirectory ? (
					<span>{openFolder ? <OpenFolderIcon /> : <FolderIcon />}</span>
				) : (
					<span>
						<TextFileIcon />
					</span>
				)}
				<span className="text-sm text-gray-300">{node.name}</span>
			</div>

			{openFolder && node.children && (
				<div className="ml-5">
					{node.children.map((child, index) => (
						<TreeNode key={index} node={child} selectedPaths={selectedPaths} onToggle={onToggle} />
					))}
				</div>
			)}
		</div>
	);
};
export default TreeNode;
