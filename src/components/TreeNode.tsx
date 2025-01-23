import { useState } from 'react';
export const TreeNode = ({ node }) => {
	const [openFolder, setOpenFolder] = useState(false);

	const toggle = () => setOpenFolder((prev) => !prev);

	return (
		<div className="">
			<div className="flex gap-2" onClick={toggle}>
				{node.isDirectory ? <span className="">{openFolder ? '📂' : '📁'}</span> : <span>📄</span>}
				<span className="text-sm">{node.name}</span>
			</div>

			{openFolder && node.children && (
				<div className="ml-3">
					{node.children.map((child, index) => (
						<TreeNode key={index} node={child} />
					))}
				</div>
			)}
		</div>
	);
};
export default TreeNode;
