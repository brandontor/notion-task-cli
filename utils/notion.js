const { Client } = require('@notionhq/client');
const {
	getTaskTitle,
	getTaskTemplate,
	getTaskType
} = require('../helpers/promptHelper');
const chalk = require('chalk');
const ora = require('ora');

const notion = new Client({ auth: process.env.NOTION_KEY });
const spinner = ora({
	text: 'Creating Task',
	color: 'blue',
	spinner: 'moon'
});

async function addBlankTask() {
	const taskTitle = await getTaskTitle();
	spinner.start();

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

		const getDailyPlannerURL = await notion.pages.retrieve({
			page_id: process.env.NOTION_DAILY_PLANNER_PAGE_ID
		});
		spinner.succeed(chalk.green('Success! Task added.'));
		console.log(chalk.green(getDailyPlannerURL.url));
	} catch (error) {
		spinner.fail(chalk.red('Something went wrong'));
		console.error(error.body);
	}
}

async function addTemplateTask() {
	const template = await getTaskTemplate();
	const taskTitle = await getTaskTitle();

	spinner.start();

	try {
		await notion.pages.create({
			parent: { database_id: process.env.NOTION_TASK_DATABASE_ID },
			icon: template.icon,
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

		const getDailyPlannerURL = await notion.pages.retrieve({
			page_id: process.env.NOTION_DAILY_PLANNER_PAGE_ID
		});

		spinner.succeed(chalk.green('Success! Task added.'));
		console.log(chalk.green(getDailyPlannerURL.url));
	} catch (e) {
		spinner.fail(chalk.red('Something went wrong'));
		console.log(e);
	}
}

module.exports = async function notion() {
	const { template } = await getTaskType();

	if (template) {
		addTemplateTask();
	} else {
		addBlankTask();
	}
};
