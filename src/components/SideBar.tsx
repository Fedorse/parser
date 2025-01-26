import { ToggleIcon } from '../icons/ToggleIcon';
import Button from './Button';
import Card from './Card';
import FileTree from './FileTree';
import { testPrompts } from '../mockData';

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
			className={`w-64 fixed z-10 h-full  bg-[#F4F4F5] rounded p-4  overflow-auto ${
				isOpen ? 'translate-x-0' : '-translate-x-full'
			} transition-transform duration-300 ease-in-out`}
		>
			<div className="flex gap-4 items-center ">
				<div className="flex">
					<Button onClick={onToggle}>
						<ToggleIcon />
					</Button>
				</div>
				<div className="border-l border-gray-500 pl-2 font-semibold ">
					<h2>{showFileStructure ? 'File Structure' : 'Saved Prompts'}</h2>
				</div>
			</div>
			<div>
				{showFileStructure && fileStructure && fileStructure.length > 0 ? (
					<>
						<div className="pt-4">
							<FileTree
								data={fileStructure}
								onToggle={toggleNodeCheck}
								selectedPaths={selectedPaths}
							/>
						</div>
					</>
				) : (
					<>
						{testPrompts.map((prompt) => (
							<Card onClick={() => onPreview(prompt.code)} code={prompt.code} key={prompt.id} />
						))}
					</>
				)}
			</div>
		</aside>
	);
};

export default SideBar;
