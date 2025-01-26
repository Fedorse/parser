export const createFileTree = (files) => {
	const root = [];

	files.forEach((file) => {
		const parts = file.webkitRelativePath.split('/');
		let currentLevel = root;

		parts.forEach((part, index) => {
			if (!part) return;
			const isLast = index === parts.length - 1;

			let existingNode = currentLevel.find((node) => node.name === part);
			if (!existingNode) {
				// Создаём новый узел
				existingNode = {
					name: part,
					isDirectory: !isLast,
					// path для файла:
					path: isLast ? file.webkitRelativePath : parts.slice(0, index + 1).join('/')
				};
				// Если директория - добавим children
				if (!isLast) {
					existingNode.children = [];
				}
				currentLevel.push(existingNode);
			}

			// Если не последний, спускаемся в children
			if (!isLast) {
				currentLevel = existingNode.children;
			}
		});
	});

	return root;
};
