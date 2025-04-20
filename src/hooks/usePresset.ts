import { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';
import { invoke } from '@tauri-apps/api/core';

export type PresetMap = { [name: string]: string[] };

export const usePreset = () => {
	const [presets, setPresets] = useState<PresetMap>({});
	const [selected, setSelected] = useState<string | null>(null);

	const [form, setForm] = useState({
		isOpen: false,
		name: '',
		patterns: ''
	});

	const { success, error } = useToast();

	const fetchPresets = useCallback(async () => {
		try {
			const res = await invoke<string>('get_presets');
			const parsed = JSON.parse(res);
			setPresets(parsed);
		} catch (err) {
			console.error('Failed to fetch presets:', err);
			error('Failed to fetch presets');
		}
	}, [error]);

	const savePreset = async () => {
		const ignorePatterns = form.patterns.split(',').map((str) => str.trim());
		try {
			await invoke('update_preset', {
				name: form.name,
				ignorePatterns
			});
			setPresets((prev) => ({ ...prev, [form.name]: ignorePatterns }));
			setForm({ isOpen: false, name: '', patterns: '' });
			success('Preset saved');
		} catch (err) {
			console.error('Failed to save preset:', err);
			error('Failed to save preset');
		}
	};

	const deletePreset = async (preset: string) => {
		try {
			await invoke('delete_preset', { name: preset });
			setPresets((prev) => {
				const copy = { ...prev };
				delete copy[preset];
				return copy;
			});
			setSelected(null);
			success('Preset deleted');
		} catch (err) {
			console.error('Failed to delete preset:', err);
			error('Failed to delete preset');
		}
	};

	const toggleForm = () => {
		setForm((prev) => ({ ...prev, isOpen: !prev.isOpen }));
	};
	useEffect(() => {
		fetchPresets();
	}, [fetchPresets]);
	return {
		presets,
		selected,
		setSelected,
		form,
		setForm,
		savePreset,
		deletePreset,
		toggleForm
	};
};
