import { Link, useLocation } from 'react-router-dom';
import { ArrowIcon } from '../icons/ArrowIcon';
import { GitIcon } from '../icons/GitIcon';
import { SunIcon } from '../icons/SunIcon';
import { MoonIcon } from '../icons/MoonIcon';
import { useState } from 'react';
export const Navbar = () => {
	const [isDarkIcon, setIsDarkIcon] = useState(false);
	const location = useLocation();
	const isHomePage = location.pathname === '/';

	const toggleTheme = () => {
		setIsDarkIcon((prev) => !prev);
	};
	return (
		<nav className=" w-full h-20 flex items-center px-10">
			<div className="flex justify-between items-center w-full h-full">
				<div className="flex gap-4 items-center">
					{!isHomePage && (
						<Link
							to="/"
							className="text-xl text-white hover:text-blue-600 transition-colors flex items-center"
						>
							<ArrowIcon />
						</Link>
					)}
					<Link
						to="/saved-files"
						className={`text-xl ${
							location.pathname === '/saved-files' ? 'text-white' : 'text-white/50'
						} hover:text-white transition-colors`}
					>
						Saved Files
					</Link>
				</div>
				<div className="flex items-center gap-4 text-white">
					<button
						onClick={toggleTheme}
						className="text-white hover:text-blue-400 transition-colors"
					>
						{isDarkIcon ? <SunIcon /> : <MoonIcon />}
					</button>

					<a href="https://github.com/Fedorse/parser-ai">
						<GitIcon />
					</a>
				</div>
			</div>
		</nav>
	);
};
export default Navbar;
