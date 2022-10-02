<p align="center">
  <img src="static/sveltekit-electron.svg" />
</p>

# Shumai Analytics

Analytics Dashboard for Shumai's `network` module.

## Setup

Either Build the app using the `Getting Started` steps below or download the latest release.

### Shumai Distributed Example

1. Clone the [Shumai repository](https://github.com/facebookresearch/shumai)
2. Setup/install deps & run the distributed `serve.sh` script

```sh
# install Shumai
cd shumai
bun install
bash examples/distributed/serve.sh
```

3. In a new terminal window, run the distributed `client.sh` script

```sh
bash examples/distributed/client.sh
```

Custom distributed training setup:

_N.B. Only working if `host` (central server) is at `localhost:3000` (next release will allow passing in URL for `host`_

## Stack

Sveltekit + Electron + Typescript

<br />

## Getting Started

You can use either `npm` (`pnpm` confirmed working on OSx), there were known issues with the [SvelteKit/Electron template and `yarn`](https://github.com/FractalHQ/sveltekit-electron/issues/12#issuecomment-1068399385)

|         |                                             |
| ------- | ------------------------------------------- |
| Clone   | · `npx degit fractalhq/sveltekit-electron ` |
| Install | · `npm install`                             |
| Develop | · `npm run dev`                             |
| Build   | · `npm run build`                           |

<br />

<p align="center">
  <img src="screenshot.png" />
</p>

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Svelte for VSCode](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)

## Change Build Targets

In the scripts section of package.json you can update the `build:electron` command and change the flags to set the targets, by default it uses `-mwl` which is Mac, Windows, and Linux
