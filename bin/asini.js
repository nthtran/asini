#!/usr/bin/env node

var asini = require("../lib/index");
var logger = require("../lib/logger");
var chalk = require("chalk");
var meow = require("meow");

var cli = meow([
  "Usage",
  "  $ asini [command]",
  "",
  "Commands:",
  "  bootstrap  Link together local packages and npm install remaining package dependencies",
  "  publish    Publish updated packages to npm",
  "  updated    Check which packages have changed since the last release",
  "  import     Import a package with git history from an external repository",
  "  clean      Remove the node_modules directory from all packages",
  "  diff       Diff all packages or a single package since the last release",
  "  init       Initialize an asini repo",
  "  run        Run npm script in each package",
  "  exec       Run a command in each package",
  "  ls         List all public packages",
  "",
  "Options:",
  "  --independent, -i    Version packages independently",
  "  --canary, -c         Publish packages after every successful merge using the sha as part of the tag",
  "  --skip-git           Skip commiting, tagging, and pushing git changes (only affects publish)",
  "  --skip-npm           Stop before actually publishing change to npm (only affects publish)",
  "  --npm-tag [tagname]  Publish packages with the specified npm dist-tag",
  "  --scope [glob]       Restricts the scope to package names matching the given glob.",
  "  --ignore [glob]      Ignores packages with names matching the given glob.",
  "  --force-publish      Force publish for the specified packages (comma-separated) or all packages using * (skips the git diff check for changed packages)",
  "  --yes                Skip all confirmation prompts",
  "  --repo-version       Specify repo version to publish",
  "  --concurrency        How many threads to use if asini parallelises the tasks (defaults to 4)",
  "  --loglevel           What level of logs to report (defaults to \"info\").  On failure, all logs are written to asini-debug.log in the current working directory.",
], {
  alias: {
    independent: "i",
    canary: "c",
    forcePublish: "force-version"
  }
});

require("signal-exit").unload();

logger.setLogLevel(cli.flags.loglevel);

var commandName = cli.input[0];
var Command = asini.__commands__[commandName];

if (!Command) {

  // Don't emit "Invalid asini command: undefined" when run with no command.
  if (commandName) {
    console.log(chalk.red("Invalid asini command: " + commandName));
  }

  cli.showHelp();
} else {
  var command = new Command(cli.input.slice(1), cli.flags);
  command.run();
}
