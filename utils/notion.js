const { templateEnum } = require('./templateEnum');
const { Client } = require('@notionhq/client');
const chalk = require('chalk')
const inquirer = require('inquirer');
const ora = require('ora');

const notion = new Client({ auth: process.env.NOTION_KEY });
const prompt = inquirer.createPromptModule();
const spinner = ora({
	text: "Creating Task",
	color: "blue",
	spinner:"moon"
})


async function addBlankTask() {
	const taskTitle = await prompt({
		type: 'input',
		name: 'taskTitle',
		message: 'What is your task title?'
	}).then(response => {
		return response.taskTitle;
	});

	spinner.start()
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
		})

		const getDailyPlannerURL = await notion.pages.retrieve({
			page_id: process.env.NOTION_DAILY_PLANNER_PAGE_ID
		});
		spinner.succeed(chalk.green('Success! Task added.'));
		console.log(chalk.green(getDailyPlannerURL.url));
	} catch (error) {
		spinner.fail(chalk.red('Something went wrong'))
		console.error(error.body);
	}
}

async function addTemplateTask() {
	const getTemplateTitle = await prompt({
		type: 'list',
		message: 'Which template would you like to use?',
		name: 'templateTitle',
		choices: Object.keys(templateEnum)
	}).then(response => {
		return response.templateTitle;
	});

	const getTaskTitle = await prompt({
		type: 'input',
		name: 'taskTitle',
		message: 'What is your task title?'
	}).then(response => {
		return response.taskTitle;
	});

	spinner.start();

	try {
		await notion.pages.create({
			parent: { database_id: process.env.NOTION_TASK_DATABASE_ID },
			icon: {
				type: templateEnum[getTemplateTitle].icon.type,
				emoji: templateEnum[getTemplateTitle].icon.emoji
			},
			properties: {
				title: {
					title: [
						{
							text: {
								content: getTaskTitle
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

		const getDailyPlannerURL = await notion.pages.retrieve({
			page_id: process.env.NOTION_DAILY_PLANNER_PAGE_ID
		});

		spinner.succeed(chalk.green('Success! Task added.'));
		console.log(chalk.green(getDailyPlannerURL.url));
	} catch (e) {
		spinner.fail(chalk.red('Something went wrong'))
		console.log(e);
	}
}

module.exports = async function notion() {
	await prompt({
		type: 'confirm',
		name: 'template',
		message: 'Would you like to build from a template?'
	}).then(response => {
		if (response.template) {
			addTemplateTask();
		} else {
			addBlankTask();
		}
	});
};
