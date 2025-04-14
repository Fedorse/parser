import DragAndDrop from '../components/DragAndDrop';
import GroupButtons from '../components/GroupButtons';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '../hooks/useToast';
import { Preset } from '../components/Preset';
import { useState, useEffect } from 'react';

export const MainPage = () => {
	const [showPresets, setShowPresets] = useState(false);
	const [showNewPresets, setShowNewPresets] = useState(false);
	const [presets, setPresets] = useState({ default: [], saved: [] });
	const [selectedPreset, setSelectedPreset] = useState([]);
	const [newPreset, setNewPreset] = useState({ name: '', ignorePatterns: '' });
	const { success, error } = useToast();

	const loadPresets = async () => {
		const res = await invoke('get_presets');
		setPresets(res);
	};

	const parseFiles = async (files) => {
		const ignorePatterns = selectedPreset.reduce((acc, preset) => {
			return preset.ignore_patterns ? [...acc, ...preset.ignore_patterns] : acc;
		}, []);

		try {
			await invoke('parse', {
				paths: files,
				ignorePatterns
			});
			success('Files parsed successfully');
		} catch (e) {
			error('Failed to parse files');
		}
	};
	const handlePresetsDelete = async (preset) => {
		await invoke('delete_preset', { preset });
	};
	const handlePresetsSave = async () => {
		await invoke('save_preset', {
			preset: {
				...newPreset,
				ignore_patterns: newPreset.ignorePatterns.split(',')
			}
		});
		setNewPreset({ name: '', ignorePatterns: '' });
		setShowNewPresets(false);
	};

	useEffect(() => {
		loadPresets();
	}, [handlePresetsDelete]);
	return (
		<main className="h-full flex flex-col w-full items-center justify-center">
			<DragAndDrop parseFiles={parseFiles} />
			<GroupButtons
				parseFiles={parseFiles}
				setShowPresets={setShowPresets}
				showPresets={showPresets}
				setShowNewPresets={setShowNewPresets}
				showNewPresets={showNewPresets}
			/>
			{showPresets && (
				<Preset
					handlePresetsDelete={handlePresetsDelete}
					presets={presets}
					selectedPreset={selectedPreset}
					setSelectedPreset={setSelectedPreset}
				/>
			)}
			{showNewPresets && (
				<div className=" mt-1 w-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
					<input
						value={newPreset.name}
						onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
						className="w-full h-8 rounded mr-3 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
						type="text"
						placeholder="Name presets"
					/>
					<input
						value={newPreset.ignorePatterns}
						onChange={(e) => setNewPreset({ ...newPreset, ignorePatterns: e.target.value })}
						className="w-full h-8 rounded mr-3 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
						type="text"
						placeholder="Files to ignore, comma separated"
					/>
					<button onClick={handlePresetsSave}>Add new preset</button>
				</div>
			)}
		</main>
	);
};
export default MainPage;
