import * as vscode from 'vscode';
import { GitExtension } from './git';

export async function activate() {
	var conf = vscode.workspace.getConfiguration("gitcheck");
	const domain = conf.get<string>("domain");
	const name = conf.get<string>("name");
	const email = conf.get<string>("email");

	if (!vscode.workspace.workspaceFolders) {
		console.log("No opened workspace");
		return;
	}

	if (!(domain && name && email)) {
		console.log("Missing config params");
		return;
	}

	const gitExt = vscode.extensions.getExtension<GitExtension>('vscode.git')!;
	const git = gitExt.exports.getAPI(1);
	if (!git) {
		console.log("Git extension disabled");
		return;
	}
	
	const repository = await git.openRepository(vscode.workspace.workspaceFolders[0].uri);
	
	if (!repository) {
		console.error("Cannot open git repository");
		return;
	}

	repository.state.remotes.forEach(async remote => {
		const pushUrl = remote.pushUrl;
		if (pushUrl && pushUrl.includes(domain)) {
			var gitConfig = await repository.getConfigs();
			var gitName:string = "";
			var gitEmail:string = "";
			gitConfig = gitConfig.filter( elem => {
				return elem.key === "user.name" || elem.key === "user.email";
			});
			if (gitConfig.length === 0) {
				console.error("Missing user creds in git");
				const option = await vscode.window.showErrorMessage("Missing user creds in git", "Overwrite");
				if (option && option === "Overwrite") {
					await repository.setConfig("user.name", name);
					await repository.setConfig("user.email", email);
				}
				return;
			}
			gitConfig.forEach(c => {
				switch (c.key) {
					case "user.name":
						gitName = c.value;
						break;
						
					case "user.email":
						gitEmail = c.value;
						break;
						
					default:
						break;
				}
			});
			if (gitName !== name || gitEmail !== email) {
				console.error("Wrong user settings in git");
				const option = await vscode.window.showErrorMessage("Wrong user settings in git", "Overwrite");
				if (option && option === "Overwrite") {
					await repository.setConfig("user.name", name);
					await repository.setConfig("user.email", email);
				}	
			}
		}
	});
}

export function deactivate() {}
