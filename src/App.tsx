import './App.css';
import { useState } from 'react';
import { useFileTree } from './hooks/useFileTree';

import SideBar from './components/SideBar';
import Button from './components/Button';
import PressetsModal from './components/PressetsModal';
import PreviewModal from './components/PreviewModal';
import DragAndDrop from './components/DragAndDrop';
import Header from './components/Header';

function App() {
	const [isSideBarOpen, setIsSideBarOpen] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [previewCode, setPreviewCode] = useState(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	const {
		fileStructure,
		selectedPaths,
		showFileStructure,
		handleFolderSelect,
		toggleNodeCheck,
		parseSelected
	} = useFileTree();

	const closePreview = () => {
		setPreviewCode(null);
		setIsPreviewOpen(false);
	};
	const openPreview = (code: string) => {
		setPreviewCode(code);
		setIsPreviewOpen(true);
	};

	return (
		<main className="flex h-screen w-screen bg-gradient-to-r from-gray-950 to-black  ">
			<SideBar
				isOpen={isSideBarOpen}
				onToggle={() => setIsSideBarOpen(!isSideBarOpen)}
				onPreview={openPreview}
				fileStructure={fileStructure}
				showFileStructure={showFileStructure}
				toggleNodeCheck={toggleNodeCheck}
				selectedPaths={selectedPaths}
			/>

			<section className=" flex-1 flex flex-col w-full h-full ">
				<Header
					setIsModalOpen={setIsModalOpen}
					setIsSideBarOpen={setIsSideBarOpen}
					isSideBarOpen={isSideBarOpen}
				/>
				<div className="flex items-center justify-center h-full">
					{!showFileStructure ? (
						<DragAndDrop onFolderSelected={handleFolderSelect} />
					) : (
						<Button onClick={parseSelected}>Parse your files</Button>
					)}
				</div>
			</section>

			<PressetsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
			<PreviewModal code={previewCode} onClose={closePreview} isOpen={isPreviewOpen} />
		</main>
	);
}
