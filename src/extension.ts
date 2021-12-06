import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "gitcheck" is now active!');

	let disposable = vscode.commands.registerCommand('gitcheck.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Git User Check!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
