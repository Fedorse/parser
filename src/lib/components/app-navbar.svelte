<script>
import {page} from '$app/state'
import FileIcon from '@lucide/svelte/icons/file'
import Back from '@lucide/svelte/icons/arrow-left'
import ToggleThemeButton from '$lib/components/theme-switch-button.svelte'

let homePage = $derived(page.route.id === '/' )
</script>

<nav class="flex items-center justify-between h-20 w-full px-4">
    <div>
        {#if homePage}
        <a href="/files"><FileIcon /></a>
        {:else}
        <a href="/"><Back /></a>
        {/if}
    </div>
	<div class="flex items-center gap-2">
		<ToggleThemeButton />
	</div>
</nav>