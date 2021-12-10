import * as vscode from 'vscode';
import { GitExtension, Repository } from './git';

class UserConf {
	domain: string = "";
	name: string = "";
	email:string = "";

	valid: boolean = false;

	constructor() {
		var conf = vscode.workspace.getConfiguration("gitcheck");
		const _domain = conf.get<string>("domain");
		const _name = conf.get<string>("name");
		const _email = conf.get<string>("email");
		if (!(_domain && _name && _email)) {
			console.log("Missing config params");
			this.valid = false;
		} else {
			this.domain = _domain;
			this.name = _name;
			this.email = _email;
			this.valid = true;
		}		
	}
}

export async function activate() {
	const userConf = new UserConf();
	if (!userConf.valid) {
		return;
	}

	if (!vscode.workspace.workspaceFolders) {
		console.log("No opened workspace");
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

	let remotesLen:number = 0;
	repository.state.onDidChange(() => {
		if (remotesLen > 0) {
			return;
		}
		remotesLen = repository.state.remotes.length;

		if (remotesLen > 0) {
			gitCheck(repository, userConf);
		}
	});
}

function gitCheck(repo:Repository, conf:UserConf) {
	repo.state.remotes.forEach(async remote => {
		const pushUrl = remote.pushUrl;
		if (pushUrl && pushUrl.includes(conf.domain)) {
			var gitConfig = await repo.getConfigs();
			var gitName:string = "";
			var gitEmail:string = "";
			gitConfig = gitConfig.filter( elem => {
				return elem.key === "user.name" || elem.key === "user.email";
			});
			if (gitConfig.length === 0) {
				console.error("Missing user creds in git");
				const option = await vscode.window.showErrorMessage("Missing user settings in git", "Overwrite");
				if (option && option === "Overwrite") {
					await repo.setConfig("user.name", conf.name);
					await repo.setConfig("user.email", conf.email);
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
			if (gitName !== conf.name || gitEmail !== conf.email) {
				console.error("Wrong user settings in git");
				const option = await vscode.window.showErrorMessage("Wrong user settings in git", "Overwrite");
				if (option && option === "Overwrite") {
					await repo.setConfig("user.name", conf.name);
					await repo.setConfig("user.email", conf.email);
				}	
			}
		}
	});
}

export function deactivate() {}
