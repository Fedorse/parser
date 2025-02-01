import Button from './Button';
import { ToggleIcon } from '../icons/ToggleIcon';
import { SettingIcon } from '../icons/SettingIcon';
const Header = ({ setIsModalOpen, setIsSideBarOpen, isSideBarOpen }: any) => {
	return (
		<header
			className={`flex z-30 p-4  text-white items-center w-full ${
				isSideBarOpen ? 'justify-end' : 'justify-between'
			}`}
		>
			<div
				className={`flex transition-opacity duration-500 ${
					isSideBarOpen ? 'opacity-0 : ' : 'opacity-100'
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
