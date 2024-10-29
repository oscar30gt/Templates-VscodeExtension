const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');

///////////////////////////////////////////////////////
/////////////////// EXTENSION CORE ////////////////////
///////////////////////////////////////////////////////

/**
 * @summary This method is called when the extension is activated
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	registerCommands(context);
	registerEvents(context);
}

/**
 * @summary This method is called when the extension is deactivated
 */
function deactivate() { }

module.exports = {
	activate,
	deactivate
};

///////////////////////////////////////////////////////
////////////// INITIAL CONTENT TEMPLATES //////////////
///////////////////////////////////////////////////////

// Registers the vscode events
function registerEvents(ctx) {
	const onFileCreated = vscode.workspace.onDidCreateFiles(async (event) => {
		for (const file of event.files) {
			const fileExt = path.extname(file.fsPath);

			const template = await findTemplateForFile(fileExt);

			if (template) {
				try {
					await writeTemplateContentToFile(template.templateFile, file.fsPath);
				} catch { }
			}
		}
	});

	ctx.subscriptions.push(onFileCreated);
}

// Gets a configuration for the current file type
async function findTemplateForFile(fileExt) {
	const config = vscode.workspace.getConfiguration('templates');
	const templates = config.get('initialContentTemplates', []);

	return templates.find(t => t.fileExtensions.includes(fileExt) ||
		('.' + t.fileExtensions).includes(fileExt));
}

// Pastes the content of a template in the created file
async function writeTemplateContentToFile(templateFilePath, targetFilePath) {
	const fileName = path.basename(targetFilePath);
	const fileNameNoExtension = removeAfterLastDot(fileName);
	
	let templateContent = await getFileContent(templateFilePath);
	templateContent = replacePlaceholders(templateContent, { 
		fileName: fileName,
		fileNameNoExtension: fileNameNoExtension
	});

	await fs.writeFile(targetFilePath, templateContent);
}

// Removes the template placeholders with actual info
function replacePlaceholders(text, info) {
	text = text.replace("[FILENAME]", info.fileName);
	text = text.replace("[FILENAMENOEXTENSION]", info.fileNameNoExtension);
	
	return text;
}

///////////////////////////////////////////////////////
////////////////// SNIPPET TEMPLATES //////////////////
///////////////////////////////////////////////////////

// Registers the vscode commands
function registerCommands(ctx) {
	const pasteSnippet = vscode.commands.registerCommand("FileTemplates.loadTemplate", () => {
		showTemplatePicker();
	});

	ctx.subscriptions.push(pasteSnippet);
}

// Shows a quick input widget to allow the user to select the template to paste
async function showTemplatePicker() {
	const config = vscode.workspace.getConfiguration('templates');
	const templates = config.get('snippetTemplates', []);

	const options = templates.map(template => ({
		label: template.name,
		content: template.templateFile,
	}));

	const selection = await vscode.window.showQuickPick(options, {
		placeHolder: 'Select a Template'
	});

	const text = await getFileContent(selection.content);
	pasteAtCursor(text, selection.removeContent);
}

///////////////////////////////////////////////////////
//////////////////// UTILS & TOOLS ////////////////////
///////////////////////////////////////////////////////

// Pastes the given text at the cursor postition on the focused file
function pasteAtCursor(text) {
	const editor = vscode.window.activeTextEditor;

	if (!editor)
		return;

	const position = editor.selection.active;
	editor.edit(editBuilder => {
		editBuilder.insert(position, text);
	});
}

// Removes the content after the last dot in a string
function removeAfterLastDot(str) {
	const lastDotIndex = str.lastIndexOf('.');
	if (lastDotIndex === -1) {
		return str;
	}

	return str.substring(0, lastDotIndex);
}

// Gets the text content of a file
async function getFileContent(path) {
	try {
		const content = await fs.readFile(path, 'utf-8');
		return content;
	} catch {
		vscode.window.showErrorMessage(`Unable to read file: ${path}`);
	}
}