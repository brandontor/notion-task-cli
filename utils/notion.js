const { addBlankTask, getDatabases, addTemplateTask, getTasks} = require("../helpers/notionHelper")
const { selectDatabase,welcomePrompt, getTaskType } = require('../helpers/promptHelper');

async function addTask(db){
	const taskType = await getTaskType()
	const {template} = taskType

	if(!template) {
		await addBlankTask(db)
	} else {
		addTemplateTask(db)
	}
}

async function readTask(db) {
	await getTasks(db)
}

async function updateTask(db) {

}

const actionEnum = {
	"Add": (db) => {
		addTask(db)
	},
	"Get": (db) => {
		readTask(db)
	},
	"Update" :(db) => {
		updateTask(db)
	}
}

module.exports = async function notion(flag) {

	// if(!flag) {
	// 	console.log("There was a flag")
	// }

	try{
		const selectedAction = await welcomePrompt()
		const databases = await getDatabases()
		const selectedDatabase = await selectDatabase(databases)
		actionEnum[selectedAction](selectedDatabase)
	} catch(e) {
		console.log(e)
		process.exit(1)
	}
};
