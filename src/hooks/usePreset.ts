import { useEffect, useState } from 'react';
export const usePreset = () => {
	const [presets, setPresets] = useState({ default: [], saved: [] });
	const [selectedPreset, setSelectedPreset] = useState([]);

	const loadPresets = async () => {
		const res = await invoke('get_presets');
		setPresets(res);
	};

	useEffect(() => {
		loadPresets();
	}, []);

	return {
		presets,
		selectedPreset,
		setSelectedPreset,
		loadPresets
	};
};
