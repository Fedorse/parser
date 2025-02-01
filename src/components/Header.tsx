import Button from './Button';
import { ToggleIcon } from '../icons/ToggleIcon';
import { SettingIcon } from '../icons/SettingIcon';
const Header = ({ setIsModalOpen, setIsSideBarOpen, isSideBarOpen }: any) => {
	return (
		<header className="flex z-30 p-4 justify-between  text-white items-center w-full ">
			<div
				className={`flex transition-opacity duration-300 ${
					isSideBarOpen ? 'opacity-0 pointer-events-none : ' : 'opacity-100'
				}`}
			>
				<Button variant="icon" onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
					<ToggleIcon />
				</Button>
			</div>

			<div>
				<Button
					variant="icon"
					className="gap-2 flex items-center "
					onClick={() => setIsModalOpen(true)}
				>
					<SettingIcon />
					Presets
				</Button>
			</div>
		</header>
	);
};

export default Header;
