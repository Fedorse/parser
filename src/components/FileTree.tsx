import TreeNode from './TreeNode';

export const FileTree = ({ data, onToggle, selectedPaths }) => {
	return (
		<div className="">
			{data.map((node) => (
				<TreeNode key={node.name} node={node} selectedPaths={selectedPaths} onToggle={onToggle} />
			))}
		</div>
	);
};

export default FileTree;
