import DragAndDrop from '../components/DragAndDrop';
import GroupButtons from '../components/GroupButtons';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '../hooks/useToast';
import { Preset } from '../components/Preset';
import { useState, useEffect } from 'react';

// type PresetMap = Record<string, string[]>;
type PresetMap = {
	[key: string]: string[];
};

export const MainScreen = () => {
	const [showPresets, setShowPresets] = useState(false);
	const [selectedPreset, setSelectedPreset] = useState<string | null>('');
	const [presets, setPresets] = useState<PresetMap>({});
	const [newPresetName, setNewPresetName] = useState('');
	const [newPatterns, setNewPatterns] = useState('');
	const { success, error } = useToast();

	const fecthPresets = async () => {
		const res = await invoke<string>('get_presets');
		const parsed = JSON.parse(res);
		setPresets(parsed);
	};

	const parse = async (selected) => {
		await invoke('parse', {
			paths: selected,
			ignorePatterns: selectedPreset ? presets[selectedPreset] : []
		});
	};

	const handleNewPreset = async () => {
		const ignorePatterns = newPatterns.split(',');
		await handleUpdatePreset(newPresetName, ignorePatterns);
		setPresets((prev) => ({ ...prev, [newPresetName]: ignorePatterns }));
		setNewPresetName('');
		setNewPatterns('');
	};

	const handleDeletePreset = async (preset: string) => {
		await invoke('delete_preset', { name: preset });
	};

	const handleUpdatePreset = async (name, ignorePatterns: string[]) => {
		await invoke('update_preset', {
			name,
			ignorePatterns
		});
	};

	useEffect(() => {
		fecthPresets();
	}, []);

	return (
		<main className="h-full flex flex-col w-full items-center justify-center">
			<DragAndDrop parse={parse} />
			<GroupButtons setShowPresets={setShowPresets} showPresets={showPresets} parse={parse} />
			{/* {showPresets && (
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
			)} */}

			<div className="flex flex-col gap-4 mt-6 ">
				<input
					type="text"
					value={newPresetName}
					onChange={(e) => setNewPresetName(e.target.value)}
				/>
				<textarea value={newPatterns} onChange={(e) => setNewPatterns(e.target.value)}></textarea>
				<button className="text-white" onClick={() => handleNewPreset()}>
					Add new preset
				</button>
			</div>

			{showPresets && (
				<select
					value={selectedPreset || ''}
					onChange={(e) => setSelectedPreset(e.target.value || null)}
					className="border rounded px-2 py-1"
				>
					<option value="">No Preset</option>
					{Object.keys(presets).map((name) => (
						<option key={name} value={name}>
							{name}
						</option>
					))}
					{/* {Object.entries(presets).map(([name, ignorePatterns]) => (
						<option key={name} value={name}>
							{name}
							{ignorePatterns}
						</option>
					))} */}
				</select>
			)}
			{selectedPreset && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						handleDeletePreset(selectedPreset);
					}}
					className="text-white"
				>
					delete
				</button>
			)}
		</main>
	);
};
export default MainScreen;
