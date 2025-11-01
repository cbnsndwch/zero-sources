run `pnpm ncu` to check for outdated packages

if you find any, group them by topic/area so that packages that are related get updated together

for each group, run `pnpm ncu -u -f ...` with the appropriate filters (that's what the `-f` flag is for) to update the version specs in package.json files then `pnpm install` to install the updated packages

at each step, run a full build and test to make sure we do not introduce breakages. If you find that there were no breakages, commit the changes with a message like `chore(deps): update <area/topic> packages`

always use pnpm and/or turbo, and observe the monorepo structure when updating packages