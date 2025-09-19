<script lang="ts">
  import RoadMap from '$lib/components/road-map.svelte';
  import { SvelteFlowProvider } from '@xyflow/svelte';

  import type { FileNode } from '$lib/utils';

  export const mockRoots: FileNode[] = [
    {
      name: 'src',
      path: '/project/src',
      type: 'Directory',
      children: [
        { name: 'main.ts', path: '/project/src/main.ts', type: 'File' },
        {
          name: 'app',
          path: '/project/src/app',
          type: 'Directory',
          children: [
            { name: 'App.svelte', path: '/project/src/app/App.svelte', type: 'File' },
            { name: 'Header.svelte', path: '/project/src/app/Header.svelte', type: 'File' },
            { name: 'Footer.svelte', path: '/project/src/app/Footer.svelte', type: 'File' }
          ]
        },
        {
          name: 'lib',
          path: '/project/src/lib',
          type: 'Directory',
          children: [
            { name: 'utils.ts', path: '/project/src/lib/utils.ts', type: 'File' },
            {
              name: 'stores',
              path: '/project/src/lib/stores',
              type: 'Directory',
              children: [
                { name: 'user.ts', path: '/project/src/lib/stores/user.ts', type: 'File' },
                { name: 'theme.ts', path: '/project/src/lib/stores/theme.ts', type: 'File' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'public',
      path: '/project/public',
      type: 'Directory',
      children: [
        { name: 'favicon.ico', path: '/project/public/favicon.ico', type: 'File' },
        { name: 'robots.txt', path: '/project/public/robots.txt', type: 'File' }
      ]
    },
    { name: 'package.json', path: '/project/package.json', type: 'File' },
    { name: 'tsconfig.json', path: '/project/tsconfig.json', type: 'File' }
  ];
</script>

<SvelteFlowProvider>
  <RoadMap roots={mockRoots} />
</SvelteFlowProvider>
