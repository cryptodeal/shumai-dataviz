import { sveltekit } from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit(), Icons({ compiler: 'svelte' })],
	server: {
		port: 5173
	}
};

export default config;
