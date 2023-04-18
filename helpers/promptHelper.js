/*

	*Various Prompt helpers for common requests

*/
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const { templateEnum } = require('../utils/templateEnum');

//Prompt to decide wether we are building a task from a template or not
async function getTaskType() {
	const taskType = await prompt({
		type: 'confirm',
		name: 'template',
		message: 'Would you like to build from a template?'
	});

	return {
		template: taskType.template ? true : false
	};
}

async function getTaskTitle() {
	const taskTitle = await prompt({
		type: 'input',
		name: 'taskTitle',
		message: 'What is your task title?'
	});

	return taskTitle.taskTitle;
}

//This prompt loads choices from a template enum
// The return contains the title of the template which can be used but also an icon object which comes from the templateEnum that can be passed to notion for adding icons

async function getTaskTemplate() {
	const getTemplateTitle = await prompt({
		type: 'list',
		message: 'Which template would you like to use?',
		name: 'templateTitle',
		choices: Object.keys(templateEnum)
	});

	return {
		templateTitle: getTemplateTitle.templateTitle,
		icon: templateEnum[getTemplateTitle.templateTitle].icon
	};
}

module.exports = { getTaskTitle, getTaskTemplate, getTaskType };
