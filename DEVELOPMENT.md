# Notes for DEVELOPMENT

## Publishing Extensions

[link](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### Installation and Setup

1. Get a Personal Access Token
2. Create a publisher
3. Login with publisher

   ```sh
       vsce login <publisher name>
       # provide your personal access token
   ```

4. Install `vsce`

   ```sh
       npm install -g vsce
   ```

### Publishing

You can auto-increment an extension's version number when you publish by specifying the SemVer compatible number to increment: `major`, `minor`, or `patch`:

```bash
vsce publish major
```

This will modify the extension's `package.json` version attribute before publishing the extension.

You can also specify a complete SemVer compatible version on the command line: `vsce publish 2.0.1`

If vsce publish is run in a git repo, it will also create a version commit and tag via npm-version. The default commit message will be extension's version, but you can supply a custom commit message using the `-m` flag. (The current version can be referenced from the commit message with `%s`.)

```sh
# from extension root
vsce package
# <extenstion-name>.vsix generated
vsce publish patch
# <publisherID>.<extension-name> published to VS Code Marketplace
```

## Extension Guidelines

[link](https://code.visualstudio.com/api/references/extension-guidelines)
