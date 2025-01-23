import TreeNode from './TreeNode';

export const FileTree = ({ data }) => {
	return (
		<div className="">
			{data.map((node) => (
				<TreeNode key={node.name} node={node} />
			))}
		</div>
	);
};

export default FileTree;
