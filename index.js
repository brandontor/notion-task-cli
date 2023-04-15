#!/usr/bin/env node

/**
 * notion-task-cli
 * Add a task to my notion task list
 *
 * @author Brandon Tor <github.com/brandontor>
 */
require('dotenv').config()
const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');
const notion = require('./utils/notion');

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;

(async () => {
	init({ clear });
	input.includes(`help`) && cli.showHelp(0);

	flags.add && (await notion())

	debug && log(flags);
})();
