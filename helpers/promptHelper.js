/*

	*Various Prompt helpers for common requests

*/
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const {getDatabases} = require("./notionHelper")
const { templateEnum } = require('../utils/templateEnum');

async function welcomePrompt() {
	const optionEnum = {
		"Add a task": "Add",
		"Update a task": "Update",
		"Retrieve my task(s)": "Get"
	}

	const selector = await prompt({
		type:'list',
		name:'action',
		message: "Welcome to the notion task CLI! Would you like to:",
		choices: Object.keys(optionEnum)
	})

	const {action} = selector

	return optionEnum[action]
}


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

async function selectDatabase() {
	const databases = await getDatabases()

	const selector = await prompt({
		type: 'list',
		message: 'Which database would you like to use?',
		name: 'selectedDatabase', 
		choices: Object.keys(databases)
	})

	const {selectedDatabase} = selector

	return selectedDatabase
}

module.exports = { getTaskTitle, getTaskTemplate, getTaskType, selectDatabase, welcomePrompt};
