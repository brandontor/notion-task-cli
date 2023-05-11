/*

	*Various Prompt helpers for common requests

*/
const inquirer = require('inquirer');
const { templateEnum } = require('../utils/templateEnum');
const prompt = inquirer.createPromptModule();

const optionEnum = {
	"Add a task": "Add",
	"Update a task": "Update",
	"Retrieve my task(s)": "Get"
}


async function welcomePrompt() {
	const selector = await prompt({
		type:'list',
		name:'action',
		message: "Welcome to the notion task CLI! What would you like to do?",
		choices: Object.keys(optionEnum)
	})

	return optionEnum[selector.action]
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



async function getTaskTitle(update) {
	//Change the prompt message based on wether you are updating a task or creating a new one	
	const message = update ? "What is your new task title ?" : "What is your task title ?"

	const taskTitle = await prompt({
		type: 'input',
		name: 'taskTitle',
		message: message
	});

	return taskTitle.taskTitle;
}

//This prompt loads choices from a template enum
// The return contains the title of the template which can be used but also an icon object which comes from the templateEnum that can be passed to notion for adding icons

async function getTaskTemplate() {
	const selector = await prompt({
		type: 'list',
		message: 'Which template would you like to use?',
		name: 'templateTitle',
		choices: Object.keys(templateEnum)
	});

	return {
		templateTitle: selector.templateTitle,
		icon: templateEnum[selector.templateTitle].icon
	};
}

async function selectDatabase(databases) {
	const selector = await prompt({
		type: 'list',
		message: 'Which database would you like to use?',
		name: 'selectedDatabase', 
		choices: Object.keys(databases)
	})
	
	const {selectedDatabase} = selector
	
	return databases[selectedDatabase]
}

async function selectTaskForUpdate(tasks) {

	const selector = await prompt({
		type: 'list',
		message: 'Which task would you like to update?',
		name:"selectedTask",
		choices: Object.keys(tasks)
	})

	return tasks[selector.selectedTask]
}

//Prompt for selecting what update action to take
async function selectUpdateActionPrompt() {
	const selector = await prompt({
		type: 'list',
		message: 'What action would you like to perform?',
		name: 'selectedUpdateAction',
		choices: ["Mark as complete", "Delete Task", "Change Task Title"]
	})

	return selector.selectedUpdateAction
}

async function confirmDeletePrompt() {
	const confirmDelete = await prompt({
		type:'confirm',
		message: 'Are you sure you want to delete this task?',
		name: 'confirm',
	})

	return confirmDelete.confirm
}

module.exports = { getTaskTitle, getTaskTemplate, getTaskType, selectDatabase, welcomePrompt, selectTaskForUpdate, selectUpdateActionPrompt, confirmDeletePrompt};
