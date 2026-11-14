# One GitHub Pages release procedure

Use the existing repository and its repair branch. Do not upload another nested `portfolio/`, hand-copy `dist/` into the root, create a replacement repository, rewrite `main`, or push a separate `gh-pages` branch.

## Manual settings check

In [repository Settings → Pages](https://github.com/Vigodang/vigodang.github.io/settings/pages), set **Build and deployment → Source → GitHub Actions**. The source branch/folder picker belongs to branch publishing and should not be used for this build. The sole workflow is `.github/workflows/pages.yml`: install, build, check, upload `dist/`, deploy. The Pages artifact must contain `index.html` at its top level. See [GitHub's publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

The existing Node 22/static build needs no site secret or extra UI library. Do not enable a second publishing workflow. Pull requests build/check/upload an artifact but cannot deploy; a push or manual dispatch from `main` can deploy after its checked build.

## Windows PowerShell: review, commit, then push only after approval

The following commands target the prepared isolated checkout. Execute each section deliberately, stopping on any failed Git command. A source-only ZIP is a review artifact; the existing checkout contains the history and branch needed for these commands.

```powershell
$ErrorActionPreference = 'Stop'
$pagesRepo = Join-Path $env:USERPROFILE 'Documents\Codex\2026-11-14\files-pasted-by-the-user-coding\work\pages-repair'
Set-Location -LiteralPath $pagesRepo
if ((git branch --show-current) -ne 'codex/repair-pages-release') { throw 'Wrong branch: stop and inspect the checkout.' }
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Fetch failed.' }
if ((git rev-parse origin/main) -ne 'ad4e92c58c500400dc99c2a94c7a15fcfdd7a619') { throw 'Remote main changed: reconcile/review before proceeding.' }
npm.cmd install --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw 'Install failed.' }
npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
npm.cmd run check
if ($LASTEXITCODE -ne 0) { throw 'Checks failed.' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Whitespace check failed.' }
git status --short
git diff HEAD --stat
```

Review the diff and the report. The legacy PDF deletion is already staged in the prepared branch. After approval, stage only the repair's known paths, then commit and push the repair branch:

```powershell
git add -- .github/workflows/pages.yml .gitignore README.md package.json scripts/build.js scripts/release-assets.js scripts/check-release.js docs/pages-repair
if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
git add -u -- src/assets
if ($LASTEXITCODE -ne 0) { throw 'Asset deletion staging failed.' }
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Staged whitespace check failed.' }
git diff --cached --name-status
# Inspect this list before continuing; it must contain only the reviewed repair.
git commit -m "Harden Pages release checks and remove obsolete resume"
if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }
git push -u origin codex/repair-pages-release
if ($LASTEXITCODE -ne 0) { throw 'Push failed.' }
```

Open a pull request into `main` on GitHub. Review its build checks and diff; merge only after approval. Squash-and-merge makes a later single-commit rollback simple. Do not dispatch a deployment from the repair branch. Merging into `main` triggers the normal deployment workflow.

## After deployment: verify the actual release

1. Open Actions → Deploy GitHub Pages. Confirm the successful run uses the merged `main` commit and that both build and deploy jobs succeeded. In the build log, check the release checks and `path: dist` upload. The workflow is unchanged in its artifact directory.
2. Compare the published manifest's `sourceCommit` with current `main`, then verify the actual transferred asset hashes. This read-only PowerShell block uses `origin/main` as the expected deployed commit; run it after the successful deployment, from the same checkout:

```powershell
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Fetch failed.' }
$pagesExpected = (git rev-parse origin/main).Trim()
$pagesBase = 'https://vigodang.github.io'
$pagesManifest = Invoke-RestMethod -Uri "$pagesBase/release-manifest.json?verify=$pagesExpected" -Headers @{ 'Cache-Control' = 'no-cache' }
if ($pagesManifest.sourceCommit -ne $pagesExpected) { throw 'Published manifest is not the expected main commit.' }
$pagesVerifyDir = Join-Path $env:TEMP ('vigo-pages-verify-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $pagesVerifyDir | Out-Null
foreach ($pagesAsset in $pagesManifest.assetSHA256.PSObject.Properties) {
    $pagesFile = Join-Path $pagesVerifyDir ($pagesAsset.Name -replace '[/\\]', '_')
    Invoke-WebRequest -Uri "$pagesBase/$($pagesAsset.Name)?verify=$pagesExpected" -Headers @{ 'Cache-Control' = 'no-cache' } -OutFile $pagesFile
    if ((Get-FileHash -LiteralPath $pagesFile -Algorithm SHA256).Hash.ToLowerInvariant() -ne $pagesAsset.Value) {
        throw "Published asset differs from manifest: $($pagesAsset.Name)"
    }
}
Write-Host "Verified main commit and all required asset hashes: $pagesExpected"
```

The unique query and no-cache request are diagnostic freshness checks, not a replacement for correct deployment. A 404 for the new manifest is expected until this repair is published; a local manifest has `sourceCommit: null` and must not be uploaded by hand. Inspect `styles.css`, `layout-refinement.css` and `case-refinement.css` in browser Network: each must return 200/304 as CSS, with those names and order. Check `--paper:#f5f2eb`, `--forest:#31584b`, serif headings and the portrait.

3. Open Home, About, Work, all six cases, Contact and Résumé at 1440, 1024, 768, 375 and 320px. Check mobile Menu/Escape, full-size diagram Fit/100%/scroll, GitHub/LinkedIn and the PDF. The PDF should show QUT, Expected July 2027 and Deep learning & AI on page 1.
4. If one browser still looks navy while transferred files/hashes match, compare a fresh browser profile/private window and inspect any appearance/theme extension. Hard-refresh with Ctrl+F5. GitHub's observed cache policy was ten minutes; wait for publication/cache propagation before concluding that source is wrong. Do not change CSS merely to mask an unverified client override.

## Rollback without rewriting history

Before this repair, live `ad4e92c` already matches the approved visual design; do **not** revert that redesign commit to the initial navy portfolio. If the repair itself causes a verified regression after a squash merge, create a rollback branch and revert only the repair's squash commit. Substitute its verified SHA below:

```powershell
git switch main
if ($LASTEXITCODE -ne 0) { throw 'Switch failed: preserve any uncommitted work first.' }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw 'Pull failed.' }
git switch -c codex/rollback-pages-repair
if ($LASTEXITCODE -ne 0) { throw 'Rollback branch creation failed.' }
$pagesRepairCommit = Read-Host 'Paste the verified repair squash commit SHA'
if ($pagesRepairCommit -notmatch '^[a-fA-F0-9]{40}$') { throw 'Use the full verified repair commit SHA.' }
git revert $pagesRepairCommit
if ($LASTEXITCODE -ne 0) { throw 'Resolve/review the revert before continuing.' }
# If this was a true merge commit, use instead: git revert -m 1 $pagesRepairCommit
npm.cmd install --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw 'Install failed.' }
npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
npm.cmd run check
if ($LASTEXITCODE -ne 0) { throw 'Checks failed.' }
# Stop on any failure; inspect the revert and obtain approval before pushing.
git push -u origin codex/rollback-pages-repair
```

Open/review/merge a rollback PR, then verify the deployed files again. A rollback may intentionally remove the new manifest; compare assets against the known-good commit instead. `git revert` adds history; never use force-push, reset `main`, delete the repository or remove its history.
