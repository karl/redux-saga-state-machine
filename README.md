# redux-saga-state-machine

[![Greenkeeper badge](https://badges.greenkeeper.io/karl/redux-saga-state-machine.svg)](https://greenkeeper.io/)

Redux Saga based state machines.

**A work in progress**

## Publishing a new version

```
yarn run publish
```

This will ask for the new version number, update the `package.json` files, and add a git tag.

You then need to push the changes to GitHub, ensure you push tags as well (you can use `git push --follow-tags`).

CircleCI will then pick up the tag, build the packages and publish them.
