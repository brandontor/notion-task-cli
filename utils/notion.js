const { addBlankTask, getDatabases, addTemplateTask, getTasks, updateWithSelectedAction } = require("../helpers/notionHelper")
const { selectDatabase, welcomePrompt, getTaskType, selectTaskForUpdate } = require('../helpers/promptHelper');

function displayTasks(tasks) {

	tasks.results.forEach((task) => {
		const result = {
			emoji: task.icon?.emoji,
			title: task.properties.Name.title[0].plain_text,
			status: task.properties.Status.checkbox ? `[ x ]` : `[ ]`
		}
		console.log(`${result.emoji} ${result.title}`, result.status)
	})

}

async function addTask(db) {
	const taskType = await getTaskType()
	const { template } = taskType

	if (!template) {
		await addBlankTask(db)
	} else {
		addTemplateTask(db)
	}
}

async function readTask(db) {
	const tasks = await getTasks(db)

	if (tasks.results.length > 0) {
		displayTasks(tasks)
	} else {
		console.log("No tasks exist, please create a new task")
		process.exit(0)
	}

}

async function updateTask(db) {
	const tasks = await getTasks(db)

	//If there are no tasks available to update then exit the process
	if(tasks.results.length <= 0){
		console.log("There are no tasks to update")
		process.exit(0)
	}
	

	//Loop over your tasks and build and enum to pass to the prompt selector
	const taskEnum = {}
	for(let task of tasks.results) {
		const emoji = task.icon?.emoji
		const title = task.properties.Name.title[0].plain_text
		const status = task.properties.Status.checkbox ? `[ x ]` : `[ ]`
		const key = `${emoji} ${title}`
		const id = task.id

		taskEnum[`${key}`] = {emoji,title,status,key, id}
	}

	const selectedTask = await selectTaskForUpdate(taskEnum)

	updateWithSelectedAction(selectedTask)
	
}

const actionEnum = {
	"Add": (db) => {
		addTask(db)
	},
	"Get": (db) => {
		readTask(db)
	},
	"Update": (db) => {
		updateTask(db)
	}
}


async function fetchAndSelectDatabase() {
	let selectedDatabase
	try {
		const databases = await getDatabases()
		selectedDatabase = await selectDatabase(databases)
	} catch(e) {
		console.log(e)
		process.exit(1)
	}

	return selectedDatabase
}

module.exports = async function notion(flag) {

	const selectedDatabase = await fetchAndSelectDatabase().catch((e) => {
		console.log(e)
		process.exit(1)
	})

	if(flag) {
		return await actionEnum[flag](selectedDatabase)
	} 

	try {
		const selectedAction = await welcomePrompt()
		actionEnum[selectedAction](selectedDatabase)
	} catch (e) {
		console.log(e)
		process.exit(1)
	}
};
