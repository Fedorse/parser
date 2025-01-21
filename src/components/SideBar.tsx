import { ToggleIcon } from '../icons/ToggleIcon';
import Button from './Button';
import Card from './Card';
import { testPrompts } from '../mockData';

const SideBar = ({ isOpen, onToggle, onPreview }: any) => {
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
					<h2>Saved Prompts</h2>
				</div>
			</div>
			{testPrompts.map((prompt) => (
				<Card onClick={() => onPreview(prompt.code)} code={prompt.code} key={prompt.id} />
			))}
		</aside>
	);
};

export default SideBar;
