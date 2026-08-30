# UI package release

## Release

1. Update `packages/ui/package.json` and the lockfile to the new semantic version.
2. Add a `packages/ui/CHANGELOG.md` entry.
3. Commit the release change, then tag it:

   ```bash
   git tag ui-vX.Y.Z
   git push origin ui-vX.Y.Z
   ```

4. GitHub Actions runs `ui-publish.yml` after the tag push. The workflow validates that the tag matches `packages/ui/package.json`, confirms that the version is not already published, checks/tests/builds the package, verifies `dist/`, and publishes it to GitHub Packages.
5. Verify the release in the repository under **Packages** or with:

   ```bash
   npm view @its-enpii/ui versions --registry=https://npm.pkg.github.com
   ```

## Consumer installation

The package scope must point to GitHub Packages. Either configure npm once:

```bash
npm config set @its-enpii:registry https://npm.pkg.github.com
```

or place the following in the consumer project's `.npmrc`:

```npmrc
@its-enpii:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Create a classic personal access token or fine-grained token with the `read:packages` permission. For GitHub Actions, grant the workflow `packages: read` and use `${{ secrets.GITHUB_TOKEN }}`. Then install:

```bash
npm install @its-enpii/ui
```
