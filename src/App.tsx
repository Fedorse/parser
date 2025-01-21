import './App.css';
import { useState } from 'react';

import SideBar from './components/SideBar';
import Button from './components/Button';
import PressetsModal from './components/PressetsModal';
import PreviewModal from './components/PreviewModal';

import { InputIcon } from './icons/InputIcon';
import { SettingIcon } from './icons/SettingIcon';
import { ToggleIcon } from './icons/ToggleIcon';

function App() {
	const [isSideBarOpen, setIsSideBarOpen] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [previewCode, setPreviewCode] = useState(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	const modalClose = () => {
		setIsModalOpen(false);
	};

	const toggleSideBar = () => {
		setIsSideBarOpen(!isSideBarOpen);
	};

	const closePreview = () => {
		setPreviewCode(null);
		setIsPreviewOpen(false);
	};
	const openPreview = (code) => {
		setPreviewCode(code);
		setIsPreviewOpen(true);
	};
	return (
		<main className="flex h-screen w-screen">
			<SideBar isOpen={isSideBarOpen} onToggle={toggleSideBar} onPreview={openPreview} />

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
			<div className="absolute top-0 right-0">
				<Button className="p-4 flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
					<SettingIcon />
					Presets
				</Button>
			</div>
			<PressetsModal isOpen={isModalOpen} onClose={modalClose} />
			<PreviewModal code={previewCode} onClose={closePreview} isOpen={isPreviewOpen} />
		</main>
	);
}

export default App;
