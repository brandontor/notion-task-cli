const { Client } = require('@notionhq/client');
const inquirer = require('inquirer');
const ora = require('ora');

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_TASK_DATABASE_ID;
const prompt = inquirer.createPromptModule();

async function addBlankTask() {
	const taskTitle = await prompt({
		type: 'input',
		name: 'taskTitle',
		message: 'What is your task title?'
	}).then(response => {
		return response.taskTitle;
	});
	const spinner = ora('Creating Task').start();
	try {
		const taskResponse = await notion.pages.create({
			parent: { database_id: databaseId },
			properties: {
				title: {
					title: [
						{
							text: {
								content: taskTitle
							}
						}
					]
				},
				Date: {
					date: {
						start: `${new Date().toISOString()}`
					}
				}
			}
		});

		// console.log(response);
		spinner.stop();
		console.log('Success! Entry added.');
		console.log(taskResponse.parent);
	} catch (error) {
		console.error(error.body);
	}
}

async function getTemplate(text) {
	try {
		const response = await notion.databases.retrieve({
			database_id: process.env.NOTION_TASK_DATABASE_ID
		});

		const pages = await notion.databases.query({
			filter: {}
		});

		console.log(response);
	} catch (e) {
		console.log(e);
	}
}

const templateEnum = [
	'Coding',
	'House Keeping',
	'Social',
	'Side Hustle',
	'Schedule/Reflection',
	'Work',
	'No Template'
];

module.exports = async function notion() {
	const template = await prompt({
		type: 'confirm',
		name: 'template',
		message: 'Would you like to build from a template?'
	}).then(response => {
		return response.template;
	});

	if (template) {
		console.log('Build from template');
	} else {
		addBlankTask();
	}

	// console.log("")
	// addItem(userRes)
	// readline.close()
	// getTemplate()
};
