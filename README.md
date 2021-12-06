# Git User Check

Sometimes, after cloning a repository from a corporate server and having already sent several commits there, you notice that you forgot to change the user settings in git.  
This extension is written to avoid this.

## Configuration
* `gitcheck.domain` – The domain (or just a substring) for which the check will be performed (you can see in the output of the command `git remote -v`).
* `gitcheck.name` – This value will be checked against the value of the git parameter `user.name`.
* `gitcheck.email` – This value will be checked against the value of the git parameter `user.email`.