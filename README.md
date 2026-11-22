# Artifact Workbench

Artifact Workbench saves selected editor text as an artifact in the library used by the Artifact Drawer extension.

## Features

- Create an artifact from the current text selection.
- Add the artifact to an existing category or create a category.
- Save the artifact's title, type, and selected text to the shared library.

## Usage

1. Select the text to save in an editor.
2. Open the Command Palette (`Ctrl+Shift+P` on Windows/Linux or `Cmd+Shift+P` on macOS).
3. Run **Create from Selection**.
4. Choose a category or create one, then enter the artifact title and type.

The extension displays a warning if there is no active editor or no selected text. Canceling any prompt stops the operation.

## Requirements

- Visual Studio Code 1.146.0 or later.
- The [Artifact Drawer](https://marketplace.visualstudio.com/items?itemName=aem2create.artifact-drawer) extension. VS Code installs it as a dependency.

## Shared library file

Artifact Workbench reads and writes the Artifact Drawer library file. If the `artifact-drawer.db-file` setting contains a path, that file is used. Otherwise, the extension uses `artifacts.json` in the Artifact Drawer extension's global storage directory. A missing file is created automatically.

To share a custom file, configure `artifact-drawer.db-file` in the Artifact Drawer settings. Both extensions should use the same path.

The file must contain a schema version 1 library object, for example:

```json
{
  "schemaVersion": 1,
  "categories": [
    {
      "title": "Code snippets",
      "artifacts": [
        {
          "title": "Example",
          "type": "JavaScript",
          "snippet": "console.log('Hello');"
        }
      ]
    }
  ]
}
```

## Extension settings

Artifact Workbench does not contribute its own settings. The shared file path is configured with the Artifact Drawer extension's `artifact-drawer.db-file` setting.
