<script lang="ts">
	import '../app.css';
	import { afterNavigate } from '$app/navigation';
	import { ElectronEvent } from '$lib/types';
	import Navbar from '$lib/ux/Navbar.svelte';
	import { themeChange } from 'theme-change';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export const ssr = false;
	let drawercontent: {
		scrollTop: number;
	} = {
		scrollTop: 0
	};
	let drawerContentScrollY = 0,
		isMaximized = false;
	function parseContentScroll() {
		drawerContentScrollY = drawercontent.scrollTop;
	}

	let drawersidebar: {
		scrollTop: number;
	};
	let drawerSidebarScrollY = 0,
		ready = false;
	function parseSidebarScroll() {
		drawerSidebarScrollY = drawersidebar.scrollTop;
	}

	onMount(() => {
		ready = true;
		themeChange(false);
		parseContentScroll();
		parseSidebarScroll();
	});

	afterNavigate(() => {
		drawercontent.scrollTop = 0;
	});

	$: if (ready && window.electron && browser) {
		window.electron.receive('from-main', (data: { type: ElectronEvent }) => {
			const { type } = data;
			if (type === ElectronEvent.MAXIMIZE) {
				isMaximized = true;
			} else {
				isMaximized = false;
			}
		});
	}
</script>

{#if ready}
	<div
		bind:this={drawercontent}
		on:scroll={parseContentScroll}
		class="drawer-content"
		style="scroll-behavior: smooth; scroll-padding-top: 5rem;"
	>
		<div class="dragbar" />

		<Navbar {drawerContentScrollY} {isMaximized} />
		<div class="pt-6 px-2 pb-10 md:px-6">
			<slot />
		</div>
	</div>
{/if}

<style>
	.dragbar {
		-webkit-app-region: drag;
		position: absolute;
		z-index: 100;
		height: 40px;
		width: 100%;
	}
</style>
