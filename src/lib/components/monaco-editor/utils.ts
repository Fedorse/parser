export const setupThemes = async (monaco) => {
  const [darkTheme, lightTheme] = await Promise.all([
    import('monaco-themes/themes/GitHub Dark.json'),
    import('monaco-themes/themes/GitHub Light.json')
  ]);
  darkTheme.colors['editor.background'] = '#09090b';

  monaco.editor.defineTheme('dark', darkTheme as any);
  monaco.editor.defineTheme('light', lightTheme as any);
};
