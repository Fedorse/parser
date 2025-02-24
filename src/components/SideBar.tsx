import { ToggleIcon } from '../icons/ToggleIcon';
import Button from './Button';
import Card from './Card';
import FileTree from './FileTree';
import { data } from '../mockData';

const SideBar = ({
	isOpen,
	onToggle,
	onPreview,
	fileStructure,
	showFileStructure,
	toggleNodeCheck,
	selectedPaths
}: any) => {
	return (
		<aside
			className={`z-10 h-full transition-all duration-500  overflow-y-scroll overflow-hidden ${
				isOpen ? 'w-64' : 'w-0 '
			} ${showFileStructure ? 'drop-shadow-[0_0_55px_rgba(59,130,246,0.4)] bg-black' : ''}  `}
		>
			<div className="flex gap-4 p-4 items-center ">
				<div className="flex">
					<Button variant="icon" onClick={onToggle}>
						<ToggleIcon />
					</Button>
				</div>
				<div className="border-l text-xl min-w-64 text-white border-gray-600 pl-2 font-normal leading-none ">
					<h2>{showFileStructure ? 'File Structure' : 'Saved Prompts'}</h2>
				</div>
			</div>
			<div>
				{showFileStructure && fileStructure && fileStructure.length > 0 ? (
					<>
						<div className="pt-2">
							<FileTree
								data={fileStructure}
								onToggle={toggleNodeCheck}
								selectedPaths={selectedPaths}
							/>
						</div>
					</>
				) : (
					<div className="p-4">
						{data.map((data) => (
							<Card onClick={() => onPreview(data.code)} code={data.code} key={data.id} />
						))}
					</div>
				)}
			</div>
		</aside>
	);
};

export default SideBar;
