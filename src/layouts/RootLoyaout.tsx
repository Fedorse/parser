import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function RootLoyaout() {
	return (
		<div className="h-screen w-full flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300 ease-in-out">
			<Navbar />
			<div className="flex-1 overflow-auto">
				<Outlet />
			</div>
		</div>
	);
}
