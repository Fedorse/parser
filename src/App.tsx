import './App.css';
import { InputIcon } from './InputIcon';
import { useState } from 'react';
import SideBar from './components/SideBar';
import { ToggleIcon } from './ToggleIcon';
import Button from './components/Button';

function App() {
	const [isSideBarOpen, setIsSideBarOpen] = useState(true);

	const toggleSideBar = () => {
		setIsSideBarOpen(!isSideBarOpen);
	};
	return (
		<main className="flex h-screen w-screen">
			<SideBar isOpen={isSideBarOpen} onToggle={toggleSideBar} />
			<div className="z-5 relative gap-4 bg-white  flex flex-col items-center justify-center text-black  w-full h-full text-xl  ">
				<input
					id="file-input"
					type="file"
					multiple
					className=" absolute inset-0 w-full h-full opacity-0"
				/>
				<InputIcon />
				<label htmlFor="file-input">Add files for Prompt</label>
			</div>
			<div className="absolute top-0 left-0">
				<Button className="p-4" onClick={toggleSideBar}>
					<ToggleIcon />
				</Button>
			</div>
		</main>
	);
}

export default App;
