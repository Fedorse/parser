import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function RootLoyaout() {
	return (
		<div className="h-screen w-full flex flex-col bg-white dark:bg-black transition-colors duration-500 transition-discrete ease-in">
			<Navbar />
			<div className="flex-1 overflow-auto">
				<Outlet />
			</div>
		</div>
	);
}
