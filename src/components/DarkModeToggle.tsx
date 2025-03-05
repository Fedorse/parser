import { useState, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { MoonIcon, SunIcon } from '../icons';

export const DarkModeToggle = () => {
	const { theme, toggleTheme } = useTheme();
	const targetTheme = theme === 'dark' ? 'light' : 'dark';
	const newBgColor = targetTheme === 'dark' ? '#000' : '#fff';

	const [animating, setAnimating] = useState(false);
	const [clipStyle, setClipStyle] = useState({});
	const buttonRef = useRef(null);

	const handleToggle = () => {
		// Определяем позицию центра кнопки
		const rect = buttonRef.current.getBoundingClientRect();
		const x = rect.left + rect.width / 2;
		const y = rect.top + rect.height / 2;

		setAnimating(true);
		// Рендерим элемент с начальным состоянием и предустановленным transition
		setClipStyle({
			clipPath: `circle(0% at ${x}px ${y}px)`,
			transition: 'clip-path 0.5s ease-out',
			willChange: 'clip-path'
		});

		// Небольшая задержка, чтобы браузер успел зафиксировать начальное значение
		setTimeout(() => {
			setClipStyle({
				clipPath: `circle(150% at ${x}px ${y}px)`,
				transition: 'clip-path 0.5s ease-out',
				willChange: 'clip-path'
			});
		}, 20);

		// По завершении анимации переключаем тему и сбрасываем анимацию
		setTimeout(() => {
			toggleTheme();
			setAnimating(false);
			setClipStyle({});
		}, 520);
	};

	return (
		<div className="relative">
			{animating && (
				<div
					className="fixed top-0 left-0 w-full h-full pointer-events-none -z-1"
					style={{
						backgroundColor: newBgColor,
						...clipStyle
					}}
				></div>
			)}
			<button
				ref={buttonRef}
				onClick={handleToggle}
				className="relative z-10 p-2 focus:outline-none"
			>
				{theme === 'dark' ? <SunIcon /> : <MoonIcon />}
			</button>
		</div>
	);
};

export default DarkModeToggle;
