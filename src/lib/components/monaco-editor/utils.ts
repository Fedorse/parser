import darkTheme from '$lib/assets/themes/GitHub Dark.json';
import lightTheme from '$lib/assets/themes/GitHub Light.json';
export const setupThemes = async (monaco: any) => {
  const dark = { ...darkTheme };
  const light = { ...lightTheme };

  dark.colors['editor.background'] = '#09090b';

  monaco.editor.defineTheme('dark', dark as any);
  monaco.editor.defineTheme('light', light as any);
};
