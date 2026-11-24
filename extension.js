const vscode = require('vscode');
const { Library } = require('artifact-package');
const path = require('path');
const fs = require('fs');
const { getDataFile } = require('vscode-extension-utilities');

const config = {
	dataFile: {
		filename: "artifacts.json",
		settingName: "db-file",
		extensionName: "artifact-drawer",
		fallbackDirectory: "aem2create.artifact-drawer"
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const disposable = vscode.commands.registerCommand('artifact-workbench.createFromSelection', async function () {
		try {
			const artifactLibrary = generateArtifactLibrary(context, config);
			const editor = vscode.window.activeTextEditor;
			if(!editor) {
				vscode.window.showWarningMessage('Open an editor and select text before creating an artifact.');
				return false;
			}
			const selection = editor.selection;
			if(selection.isEmpty) {
				vscode.window.showWarningMessage('Select text before creating an artifact.');
				return false;
			}

			const categoryChoices = artifactLibrary.getCategories();
			categoryChoices.push('Create a new category');

			let createCategoryFlag = false;
			let category = await vscode.window.showQuickPick(categoryChoices, {
				placeHolder: 'Select an artifact category'
			});
			if(!category) {
				return false;
			}

			if(category === 'Create a new category') {
				category = await vscode.window.showInputBox({
					prompt: 'Enter the category name',
					ignoreFocusOut: true
				});
				if(!category) {
					return false;
				}

				createCategoryFlag = true;
			}

			const title = await vscode.window.showInputBox({
				prompt: 'Enter the artifact name',
				ignoreFocusOut: true
			});
			if(!title) {
				return false;
			}

			const type = await vscode.window.showInputBox({
				prompt: 'Enter the artifact type',
				ignoreFocusOut: true
			});
			if(!type) {
				return false;
			}

			const artifact = {
				category,
				title,
				type,
				snippet: editor.document.getText(selection)
			};

			if(createCategoryFlag) {
				artifactLibrary.addCategory(category);
			}

			artifactLibrary.addArtifactToCategory(
				artifact.category,
				artifact.title,
				artifact.type,
				artifact.snippet
			);
			saveArtifactLibrary(generateDataFile(context, config), artifactLibrary);
			vscode.window.showInformationMessage(`Created artifact "${artifact.title}"`);
			console.log('Created artifact:', artifact);
		} catch (error) {
			console.error('createFromSelection failed:', error);
			const message = error instanceof Error ? error.message : String(error);
			vscode.window.showErrorMessage(`Could not create artifact: ${message}`);
			return false;
		}
	});

	context.subscriptions.push(disposable);

	context.subscriptions.push(
		vscode.lm.registerTool('artifact-workbench_create_category', new CreateCategoryTool(context, config))
	);
}

function generateDataFile(context, config) {
	return getDataFile(
		context,
		config.dataFile.filename,
		config.dataFile.settingName,
		config.dataFile.extensionName,
		config.dataFile.fallbackDirectory
	);
}

function generateArtifactLibrary(context, config) {
	const dataFile = generateDataFile(context, config);
	fs.mkdirSync(path.dirname(dataFile), { recursive: true });
	if(!fs.existsSync(dataFile)) {
		fs.writeFileSync(dataFile, JSON.stringify({ schemaVersion: 1, categories: [] }), 'utf8');
	}

	return Library.fromJSON(fs.readFileSync(dataFile, 'utf8'));
}

function saveArtifactLibrary(dataFile, artifactLibrary) {
	fs.writeFileSync(dataFile, JSON.stringify(artifactLibrary.toJSON(), null, 2), 'utf8');
}

// This method is called when your extension is deactivated
function deactivate() {}

/**
 * @implements {vscode.LanguageModelTool<object>}
 */
class CreateCategoryTool {
	constructor(context, config) {
		this.context = context;
		this.config = config
	}

	invoke(options) {
		
		let result;
		try {
			const artifactLibrary = generateArtifactLibrary(this.context, this.config);
			artifactLibrary.addCategory(options.input.category);
			saveArtifactLibrary(generateDataFile(this.context, this.config), artifactLibrary);
			result = {status: "passed", message: "Category added successfully"};
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			result = {status: "failed", message};
		}
		return new vscode.LanguageModelToolResult([
			new vscode.LanguageModelTextPart(JSON.stringify(result))
		]);
	}
}

module.exports = {
	activate,
	deactivate
}
