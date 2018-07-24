# redux-saga-state-machine

[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&identifier=130120161)](https://dependabot.com)

Redux Saga based state machines.

**A work in progress**

## Example

https://redux-saga-state-machine.netlify.com

## Running

Install all dependencies (and link workspace packages):

```
yarn
```

Start dev mode for each package:

```
yarn start
```

Open the example app: `http://localhost:8080`

## Tests

You can run all tests using:

```
yarn test
```

Although you might prefer to start a Jest runner for each package by running `yarn test --watch` within each package folder.

## Publishing a new version

Every commit to `master` will be automatically published as a new version by CI.

When merging a PR use the following prefixes to control the deployment:

- `no-deploy:` - Don't publish a new version for the merged PR.
- `fix:` - Publish a new **patch** version.
- `feat:` - Publish a new **minor** version.
- `BREAKING CHANGES:` - Publish a new **major** version.

If none of the prefixes are found a new patch version will be released.

The prefixes above come from: https://conventionalcommits.org/
