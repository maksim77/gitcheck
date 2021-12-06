import * as vscode from 'vscode';
import { GitExtension } from './git';

export async function activate() {
	var conf = vscode.workspace.getConfiguration("gitcheck");
	const domain = conf.get<string>("domain");
	const user = conf.get<string>("user");
	const email = conf.get<string>("email");

	if (!vscode.workspace.workspaceFolders) {
		return;
	}

	if (!(domain && user && email)) {
		console.log("Missing config params");
		return;
	}

	const git = vscode.extensions.getExtension<GitExtension>('vscode.git')!.exports.getAPI(1)!;
	const repository = await git.openRepository(vscode.workspace.workspaceFolders[0].uri);
	
	if (!repository) {
		return;
	}

	repository.state.remotes.forEach(async remote => {
		const pushUrl = remote.pushUrl;
		if (pushUrl && pushUrl.includes(domain)) {
			var gitConfig = await repository.getConfigs();
			var gitUser:string = "";
			var gitEmail:string = "";
			gitConfig = gitConfig.filter( elem => {
				return elem.key === "user.name" || elem.key === "user.email";
			});
			if (gitConfig.length === 0) {
				vscode.window.showErrorMessage("Missing user creds in git");
				return;
			}
			gitConfig.forEach(c => {
				switch (c.key) {
					case "user.name":
						gitUser = c.value;
						break;
						
					case "user.email":
						gitEmail = c.value;
						break;
						
					default:
						console.log(c.key);
				}
			});
			if (gitUser !== user || gitEmail !== email) {
				vscode.window.showErrorMessage("Wrong user creds in git");
			}
		}
	});
}

export function deactivate() {}
