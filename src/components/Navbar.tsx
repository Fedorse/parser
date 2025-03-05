import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { ArrowIcon, GitIcon, MoonIcon, SunIcon } from '../icons';
import { SavedContentIcon } from '../icons/SavedContentIcon';

export const Navbar = () => {
	const { theme, toggleTheme } = useTheme();
	const location = useLocation();
	const isHomePage = location.pathname === '/';

	return (
		<nav className="w-full h-20 flex items-center px-10">
			<div className="flex justify-between items-center w-full h-full">
				<div className="flex gap-4 items-center">
					{!isHomePage ? (
						<Link
							to="/"
							className="text-xl dark:text-white text-black hover:text-blue-600 transition-colors flex items-center"
						>
							<ArrowIcon />
						</Link>
					) : (
						<Link
							to="/saved-files"
							className="text-xl dark:text-white text-black hover:text-blue-600 transition-colors flex items-center"
						>
							<button>
								<SavedContentIcon />
							</button>
						</Link>
					)}
				</div>
				<div className="flex items-center gap-4 text-white">
					<button onClick={toggleTheme} className=" hover:text-blue-400 transition-colors">
						{theme === 'dark' ? <SunIcon /> : <MoonIcon />}
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
