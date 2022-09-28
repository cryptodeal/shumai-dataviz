<script lang="ts">
	import '../app.css';
	import { afterNavigate } from '$app/navigation';
	import Navbar from '$lib/ux/Navbar.svelte';
	import { themeChange } from 'theme-change';
	import { onMount } from 'svelte';

	let drawercontent: {
		scrollTop: number;
	};
	let drawerContentScrollY = 0;
	function parseContentScroll() {
		drawerContentScrollY = drawercontent.scrollTop;
	}

	let drawersidebar: {
		scrollTop: number;
	};
	let drawerSidebarScrollY = 0;
	function parseSidebarScroll() {
		drawerSidebarScrollY = drawersidebar.scrollTop;
	}

	onMount(() => {
		themeChange(false);
		parseContentScroll();
		parseSidebarScroll();
	});

	afterNavigate(() => {
		drawercontent.scrollTop = 0;
	});
</script>

<svelte:head>
	<script>
		(function () {
			/* return if SSR */
			if (typeof document === 'undefined') return;
			const theme = localStorage.getItem('theme');
			if (
				theme === 'night' ||
				(!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
			) {
				document.documentElement.setAttribute('data-theme', 'night');
				localStorage.setItem('theme', 'night');
			} else {
				document.documentElement.setAttribute('data-theme', 'corporate');
				localStorage.setItem('theme', 'corporate');
			}
		})();
	</script>
</svelte:head>

<div
	bind:this={drawercontent}
	on:scroll={parseContentScroll}
	class="drawer-content"
	style="scroll-behavior: smooth; scroll-padding-top: 5rem;"
>
	<Navbar {drawerContentScrollY} />
	<div class="pt-6 px-2 pb-10 md:px-6">
		<slot />
	</div>
</div>
