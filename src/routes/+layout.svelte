<script lang="ts">
	import "../app.css";
	import NavBar from "$lib/components/app-navbar.svelte";
	let { children } = $props();
   </script>
	<div class="flex h-full flex-col ">
		<NavBar/>
		{@render children?.()}
	</div>
