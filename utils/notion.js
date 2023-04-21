const { addBlankTask, getDatabases} = require("../helpers/notionHelper")
const { selectDatabase,welcomePrompt, getTaskType } = require('../helpers/promptHelper');

async function addTask(db){
	const taskType = await getTaskType()
	const {template} = taskType

	if(!template) {
		await addBlankTask(db)
	} else {
		console.log("Create a blank task")
	}
}

async function readTask(db) {
	
}

async function updateTask(db) {

}

const actionEnum = {
	"Add": (db) => {
		addTask(db)
	},
	"Read": (db) => {
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
