# Git Cheat Sheet

## Golden Rules
1. `git pull` before touching code, every session.
2. Commit small and often with clear messages.
3. `git push` at the end of every session.
4. When unsure, run `git status`.
5. Merge-based pulls only. No rebase.

## Daily Workflow
```
git status          # anything leftover?
git pull            # grab other computer / teammate changes
git add .           # stage everything
git commit -m ".."  # save snapshot locally
git pull            # sync again before pushing
git push            # send to GitHub (main = Vercel deploy)
```
Commit messages: start with a verb, under ~60 chars.

## Core Commands
| Command                   What it does 
| `git status`              Changed/staged files, ahead or behind GitHub 
| `git add path/to/file`    Stage one file 
| `git log --oneline`       Recent commits (press `q` to exit) 
| `git diff`                Unstaged line changes (press `q` to exit) 
| `git fetch`               Check GitHub without merging 
| `git clone <url>`         Copy a repo to this computer 

## Merges
- **MERGE_MSG tab opens:** default message is fine. Click Commit or close the tab, then `git push`.
- **Vim screen in terminal:** type `:wq` and Enter.
- **Conflict:** open the file, use Accept Current / Incoming / Both, remove the `<<<<<<<` `=======` `>>>>>>>` markers, save, then:
```
  git add .
  git commit -m "Resolve merge conflict"
  git push
```
- **Cancel a merge:** `git merge --abort`

## Common Errors
| Message | Fix |
| --- | --- |
| Updates were rejected | `git pull` then `git push` |
| Branch is ahead by N commits | `git push` |
| Branch is behind | `git pull` |
| Local changes would be overwritten | Commit first, then `git pull` |
| Commit your changes or stash them | `git stash`, `git pull`, `git stash pop` |
| fatal: not a git repository | Wrong folder, `cd` into the project |
| Authentication failed | Sign in again in VS Code / GitHub Desktop |

## Undoing Mistakes
| Situation | Command |
| --- | --- |
| Undo edits to one file ⚠️ | `git restore path/to/file` |
| Undo all uncommitted edits ⚠️ | `git restore .` |
| Unstage a file (keep edits) | `git restore --staged path/to/file` |
| Fix last commit message (not pushed) | `git commit --amend -m "New msg"` |
| Undo last commit, keep changes (not pushed) | `git reset --soft HEAD~1` |
| Undo a pushed commit | `git revert <commit-id>` then `git push` |
| Shelve work for later | `git stash` / `git stash pop` |
| Preview deleting new files | `git clean -nd` |
| Delete untracked files ⚠️ | `git clean -fd` |

⚠️ = permanently throws work away. Once pushed, use `revert`, not reset or amend.

## Branches
```
git switch main
git pull
git switch -c feature-name        # new branch
# work + commit
git push -u origin feature-name   # first push (Vercel preview URL)
git switch main
git pull
git merge feature-name
git push
git branch -d feature-name        # clean up
```

## Two Computers / Teammates
- Leaving a computer: commit + `git push`.
- Starting on a computer: `git pull` first.
- Duskline: pull before starting, push often, talk before editing the same Unity scene or prefab.
- Never commit: `.env.local`, `node_modules/`, `.next/`, Unity `Library/` `Temp/` `Logs/` `Build/`.

## One-Time Setup (per computer)
```
git config --global user.name "Cody McCullough"
git config --global user.email "you@example.com"
git config --global pull.rebase false
git config --global core.editor "code --wait"
git config --global --list
```
Skip the merge message editor:
- Windows (PowerShell, restart VS Code after):
  `[Environment]::SetEnvironmentVariable("GIT_MERGE_AUTOEDIT", "no", "User")`
- Mac: `echo 'export GIT_MERGE_AUTOEDIT=no' >> ~/.zshrc`