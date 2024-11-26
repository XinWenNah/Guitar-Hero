
## Usage

Setup (requires node.js):

```bash
> npm install
```

Start tests:

```bash
> npm test
```

Serve up the App (and ctrl-click the URL that appears in the console)

```bash
> npm run dev
```

To format your code, for the assignment specifications:

```bash
npx prettier . --write
```

The configuration for this is set in `.prettierrc.json`. Feel free to change this to your heart's desire, but try to ensure it still fits the assignment guidelines.

If you are using VS Code, you can also install the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode). This skeleton code is set up to automatically format your code on save. You can disable this in `.vscode/settings.json` by changing `"editor.formatOnSave": true` to `"editor.formatOnSave": false`.

## Implementing features

`src/main.ts`

-   Code file used as the entry point
-   Most of your game logic should go here
-   Contains main function that is called on page load

`src/style.css`

-   Stylesheet
-   You may edit this if you wish

`index.html`

-   Main html file
-   Contains scaffold of game window and some sample shapes
-   Feel free to add to this, but avoid changing the existing code, especially the `id` fields

`test/*.test.ts`

-   If you want to add tests, these go here
-   Uses [`vitest`](https://vitest.dev/api/)

