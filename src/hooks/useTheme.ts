import { useState, useEffect } from 'react';

export const useTheme = () => {
	const [theme, setTheme] = useState(() => {
		const savedTheme = sessionStorage.getItem('theme');
		return savedTheme || 'dark';
	});

	useEffect(() => {
		document.documentElement.classList.remove('dark', 'light');
		document.documentElement.classList.add(theme);
		sessionStorage.setItem('theme', theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
	};
	return { theme, toggleTheme };
};
