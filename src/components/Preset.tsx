import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DeleteIcon } from '../icons';

export const Preset = ({
	selectedPreset,
	setSelectedPreset,

	handlePresetsDelete,
	presets
}) => {
	const isPresetSelected = (presetName) => {
		return selectedPreset.some((item) => item.name === presetName);
	};
	const checkedPreset = (preset) => {
		const update = [...selectedPreset, preset];
		setSelectedPreset(update);
	};
	const unCheckedPreset = (preset) => {
		const update = selectedPreset.filter((item) => item.name !== preset.name);
		setSelectedPreset(update);
	};

	const handlePresetToggle = (preset) => {
		if (isPresetSelected(preset.name)) {
			unCheckedPreset(preset);
		} else {
			checkedPreset(preset);
		}
	};

	return (
		<div className=" mt-1 w-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
			<span className="text-white/30 pl-10">default patterns</span>
			{presets.map((preset) => (
				<div
					key={preset.name}
					className="flex items-center w-full text-left px-4 py-2 text-black/70 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				>
					<label className="flex items-center cursor-pointer w-full">
						<input
							type="checkbox"
							checked={isPresetSelected(preset.name)}
							onChange={() => handlePresetToggle(preset)}
							className="w-4 h-4 rounded mr-3 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
						/>
						<div className="flex flex-col">
							<span className="font-medium">{preset.name}</span>
							<span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								{preset.ignore_patterns.slice(0, 3).join(', ')}
							</span>
						</div>
					</label>
				</div>
			))}
			<span>Saved presets</span>
			{/* {presets.saved.map((preset) => (
				<div
					key={preset.name}
					className="flex items-center w-full text-left px-4 py-2 text-black/70 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				>
					<label className="flex items-center cursor-pointer w-full">
						<input
							type="checkbox"
							checked={isPresetSelected(preset.name)}
							onChange={() => handlePresetToggle(preset)}
							className="w-4 h-4 rounded mr-3 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
						/>
						<div className="flex flex-col">
							<span className="font-medium">{preset.name}</span>
							<span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								{preset.ignore_patterns.slice(0, 3).join(', ')}
							</span>
						</div>
					</label>
					<button
						onClick={() => handlePresetsDelete(preset)}
						className="text-red-500/90 flex self-end hover:text-red-400 transition-colors"
					>
						<DeleteIcon />
					</button>
				</div>
			))} */}
		</div>
	);
};
