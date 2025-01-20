import { ToggleIcon } from '../ToggleIcon';
import Button from './Button';
import Card from './Card';

const SideBar = ({ isOpen, onToggle }: any) => {
	const code = `import { useState } from "react";
                import { invoke } from "@tauri-apps/api/core";
                import "./App.css";

                function App() {
                const [name, setName] = useState("");
                const [name, setName] = useState("");
                }`;
	return (
		<div
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
			<Card code={code} />
			<Card code={code} />
			<Card code={code} />
		</div>
	);
};

export default SideBar;
