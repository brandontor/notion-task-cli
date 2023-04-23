const { addBlankTask, getDatabases, addTemplateTask, getTasks, _updateTask } = require("../helpers/notionHelper")
const { selectDatabase, welcomePrompt, getTaskType } = require('../helpers/promptHelper');

function displayTasks(tasks) {

	tasks.results.forEach((task) => {
		const result = {
			emoji: task.icon.emoji,
			title: task.properties.Name.title[0].plain_text,
			status: task.properties.Status.checkbox ? `[ x ]` : `[ ]`
		}
		console.log(`${result.emoji} ${result.title}`, chalk.dim(result.status))
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
		console.log("No tasks available")
		return null
	}

}

async function updateTask(db) {
	await _updateTask(db)
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

module.exports = async function notion(flag) {

	// if(!flag) {
	// 	console.log("There was a flag")
	// }

	try {
		const selectedAction = await welcomePrompt()
		const databases = await getDatabases()
		const selectedDatabase = await selectDatabase(databases)
		actionEnum[selectedAction](selectedDatabase)
	} catch (e) {
		console.log(e)
		process.exit(1)
	}
};
