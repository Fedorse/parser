import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function RootLoyaout() {
	return (
		<div className="min-h-screen bg-white dark:bg-black transition-colors  duration-500 transition-discrete ease-in">
			<Navbar />
			<Outlet />
		</div>
	);
}
