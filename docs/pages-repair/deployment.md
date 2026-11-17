# GitHub Pages release and verification

Run from the current repository root. The approved release is the navy/mint professional portfolio plus Vigo After Dark at `/play/`; retain both résumé URLs and all project evidence. The 14 November cream/Georgia verification procedure is superseded.

## Local checks and pull-request validation

```powershell
npm.cmd install --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw 'Install failed.' }
npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
npm.cmd run check
if ($LASTEXITCODE -ne 0) { throw 'Checks failed.' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Whitespace check failed.' }
git status --short
git diff --stat
```

The check command preserves the 16 game unit tests and adds release checks. The expected build contains 23 HTML routes and a manifest for 54 non-HTML source files. Route-set errors report missing and unexpected paths. Confirm `play/index.html` is expected, all five editorial CSS links load in order, and the game has its own five stylesheet links. An unexpected route should be investigated; do not weaken exact-set checking or remove a legitimate route merely to reach an old count.

Stage only the reviewed source, test, workflow and documentation changes for the current repair. Keep generated `dist/`, generated editorial HTML changes, screenshots, caches, dependency folders and temporary archives out of the source commit. Both existing résumé PDF paths must remain in the resulting source tree. Use the current working branch and existing [pull request #1](https://github.com/Vigodang/vigodang.github.io/pull/1), rather than recreating the old November 14 checkout or starting a second publication path:

```powershell
$pagesBranch = (git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or !$pagesBranch -or $pagesBranch -eq 'main') { throw 'Use the reviewed repair branch.' }
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Staged whitespace check failed.' }
git diff --cached --name-status
git commit -m "Align release checks with the approved After Dark portfolio"
if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }
git push origin HEAD:refs/heads/codex/repair-pages-review
if ($LASTEXITCODE -ne 0) { throw 'Push failed.' }
```

Wait for the new PR build result and inspect its commit SHA before merging the existing PR. The prior failing run describes an obsolete validator, not a reason to replace the approved dark design. A successful corrected PR build is still required; this document does not assert one has completed. Merging into `main` triggers the normal deployment. Manual dispatch from a feature branch does not publish.

## Single publishing workflow

In [repository Settings → Pages](https://github.com/Vigodang/vigodang.github.io/settings/pages), use **Build and deployment → Source → GitHub Actions**. The only workflow is `.github/workflows/pages.yml`: Node 22 install → build → check → upload checked `dist/` → deploy. The artifact has `index.html` at its top level. Pull requests build/check/upload but cannot deploy; only `main`, outside a pull-request event, receives the deployment job and scoped Pages/OIDC write permissions. Per-ref concurrency separates PR validation from the main queue.

No nested `portfolio/`, second publishing workflow, manual root copy of `dist/` or `gh-pages` branch is needed. The existing static build requires no new site secret or remote font service.

## Verify the actual published commit

After the main deployment succeeds, confirm both build and deploy jobs belong to the expected merged commit. Then compare the public manifest and transferred bytes with that main commit:

```powershell
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Fetch failed.' }
$pagesExpected = (git rev-parse origin/main).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Cannot resolve expected main commit.' }
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

The expected manifest covers all 54 non-HTML source files, including both PDFs, game modules/art and the font/license. A local build has `sourceCommit: null`; do not upload it by hand. Fresh query parameters aid diagnosis but do not substitute for verifying the actual deployment.

Inspect the five editorial stylesheets in Network, in this order: `styles.css`, `layout-refinement.css`, `case-refinement.css`, `portfolio-brand.css`, `portfolio-pages.css`. Check the navy `--bg:#091521`, mint `--green:#87f5c2`, Inter/sans headings and portrait on screen. White paper and dark text remain intentional in print media. On `/play/`, separately inspect `styles.css`, `briefing.css`, `missions.css`, `evidence.css`, `after-dark.css` under the `play/` path.

Open Home, Work, About, Contact, Résumé, all six cases and `/play/` on desktop and mobile. Verify Menu/Escape, portfolio → game → portfolio, a game → case study → game round trip, full-size visual Fit/100%/scroll and the primary résumé download. Confirm both PDF URLs return their preserved files. If appearance differs despite correct transferred bytes, inspect computed styles and browser appearance overrides before changing the design.

## Roll back a verified repair regression

Use a new repair branch and `git revert` for the specific merged repair commit, then build/check and open a rollback PR. A true merge commit requires its verified mainline selection. Preserve the approved After Dark application and both PDF URLs; do not reset main, force-push, delete history or return to the superseded cream release. Verify the deployed rollback commit and actual asset bytes again. A rollback that intentionally removes the manifest must instead be compared against the known-good source commit.
