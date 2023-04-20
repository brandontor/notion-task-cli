const welcome = require('cli-welcome');
const figlet = require('figlet');
const pkg = require('./../package.json');
const unhandled = require('cli-handle-unhandled');

module.exports = ({ clear = true }) => {
	unhandled();
	welcome({
		title: `notion-task-cli`,
		tagLine: `by Brandon Tor`,
		version: pkg.version,
		bgColor: '#36BB09',
		color: '#000000',
		bold: true,
		clear
	});

	console.log(
		`${figlet.textSync(' NOTION TASK CLI ', {
			horizontalLayout: 'full',
		})}\n`
	);
};
