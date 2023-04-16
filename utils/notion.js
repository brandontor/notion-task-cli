const { Client } = require('@notionhq/client');
const inquirer = require('inquirer');
const ora = require('ora');
const { templateEnum } = require('./templateEnum');

const notion = new Client({ auth: process.env.NOTION_KEY });
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
		await notion.pages.create({
			parent: { database_id: process.env.NOTION_TASK_DATABASE_ID },
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

		const dailyPlannerURL = await notion.pages.retrieve({
			page_id: process.env.NOTION_DAILY_PLANNER_PAGE_ID
		});

		spinner.stop();
		console.log('Success! Task added.');
		console.log(dailyPlannerURL.url);
	} catch (error) {
		console.error(error.body);
	}
}

async function addTemplateTask() {
	const templateTitle = await prompt({
		type: 'list',
		message: 'Which template would you like to use?',
		name: 'templateTitle',
		choices: Object.keys(templateEnum)
	}).then(response => {
		return response.templateTitle;
	});

	console.log('You chose', templateTitle);
	console.log('');

	const taskTitle = await prompt({
		type: 'input',
		name: 'taskTitle',
		message: 'What is your task title?'
	}).then(response => {
		return response.taskTitle;
	});

	const spinner = ora('Creating Task').start();

	try {
		await notion.pages.create({
			parent: { database_id: process.env.NOTION_TASK_DATABASE_ID },
			icon: {
				type: templateEnum[templateTitle].icon.type,
				emoji: templateEnum[templateTitle].icon.emoji
			},
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

		const dailyPlannerURL = await notion.pages.retrieve({
			page_id: process.env.NOTION_DAILY_PLANNER_PAGE_ID
		});

		spinner.stop();
		console.log('Success! Task added.');
		console.log(dailyPlannerURL.url);
	} catch (e) {
		console.log('Something went wrong', e);
	}
}

module.exports = async function notion() {
	const template = await prompt({
		type: 'confirm',
		name: 'template',
		message: 'Would you like to build from a template?'
	}).then(response => {
		return response.template;
	});

	if (template) {
		addTemplateTask();
	} else {
		addBlankTask();
	}
};
