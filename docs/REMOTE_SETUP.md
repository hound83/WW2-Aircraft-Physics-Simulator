# Remote setup status

**Local preparation is complete only after the setup check passes. Remote publication is pending.**

The connected GitHub account was verified as `hound83`. The proposed repository was not accessible during setup. The GitHub connection does not expose repository creation; browser automation stopped because it could not determine the current browser URL reliably. Noninteractive Git credential lookup found no saved credential.

Create an empty repository named `european-air-war-physics` under `hound83`, preferably private initially. Do not initialize it with a README, license or gitignore, because the local repository already contains them.

The local repository's origin is intended to be:
`https://github.com/hound83/WW2-Aircraft-Physics-Simulator.git`

Once the remote exists and authentication is available:

```sh
git push -u origin main
git push origin baseline-v2.5-import
```

Verify that GitHub shows the local main commit, the baseline tag and a successful regression workflow. Then update this document and README to reflect actual remote publication. Do not claim the remote is authoritative until the push is verified.

The setup tag marks imported reproducibility, not historical validation or a v3.0 release. No GitHub release has been published by the local setup.
