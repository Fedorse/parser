export const createFileTree = (files) => {
	const root = [];

	files.forEach((file) => {
		const parts = file.webkitRelativePath.split('/');
		let currentLevel = root;

		parts.forEach((part, index) => {
			if (!part) return;

			let existingNode = currentLevel.find((node) => node.name === part);

			const isLast = index === parts.length - 1;

			if (isLast) {
				if (!existingNode) {
					currentLevel.push({
						name: part,
						isDirectory: false,
						checked: false
					});
				}
			} else {
				if (!existingNode) {
					existingNode = {
						name: part,
						isDirectory: true,
						children: [],
						checked: false
					};
					currentLevel.push(existingNode);
				}
				currentLevel = existingNode.children;
			}
		});
	});
	return root;
};
