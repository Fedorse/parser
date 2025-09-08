<script lang="ts">
	import "../app.css";
	import NavBar from "$lib/components/app-navbar.svelte";
	import {ModeWatcher} from 'mode-watcher'
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let { children } = $props();
  </script>
  
  <Tooltip.Provider delayDuration={100}>
	<Toaster richColors={true} position="bottom-right"  />
	  <div class="flex flex-col h-screen">
		<NavBar />
		<main class="flex-1 flex p-4">
			<ModeWatcher />
		  {@render children?.()}
		</main>
	  </div>
  </Tooltip.Provider>
  