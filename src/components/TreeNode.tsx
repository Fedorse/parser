import { useState } from 'react';
export const TreeNode = ({ node, selectedPaths, onToggle }) => {
	const [openFolder, setOpenFolder] = useState(false);

	const toggle = () => setOpenFolder((prev) => !prev);

	const isChecked = selectedPaths.includes(node.path);

	const handleCheck = (e) => {
		e.stopPropagation();
		onToggle(node.path);
	};

	return (
		<div className="">
			<div className="flex gap-2" onClick={toggle}>
				<input type="checkbox" checked={isChecked} onChange={handleCheck} />
				{node.isDirectory ? <span className="">{openFolder ? '📂' : '📁'}</span> : <span>📄</span>}
				<span className="text-sm">{node.name}</span>
			</div>

			{openFolder && node.children && (
				<div className="ml-3">
					{node.children.map((child, index) => (
						<TreeNode key={index} node={child} selectedPaths={selectedPaths} onToggle={onToggle} />
					))}
				</div>
			)}
		</div>
	);
};
export default TreeNode;
