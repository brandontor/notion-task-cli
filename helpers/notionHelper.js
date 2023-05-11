/*

  *Various Notion API helpers for common requests

*/
const chalk = require('chalk');
const ora = require('ora');
const { Client } = require('@notionhq/client');
const { getTaskTitle, getTaskTemplate, updateActionPrompt, confirmDeletePrompt } = require('./promptHelper')


const notion = new Client({ auth: process.env.NOTION_KEY });

const spinner = ora({
  text: 'Creating Task',
  color: 'blue',
  spinner: 'moon'
});

async function getDatabases() {
  spinner.start("Fetching your databases ...")

  const databases = await notion.search({
    filter: {
      property: "object",
      value: "database"
    }
  }).catch(e => {
    spinner.fail("Unable to retrieve your databases")
    throw new Error(e)
  })

  if(databases.results.length <= 0) {
    throw new Error("There are no databases available. Please integrate a database to your notion API Key.")
  }

  const databaseEnum = {}

  for (let database of databases.results) {
    const response = await notion.databases.retrieve({
      database_id: `${database.id}`
    })

    const { id, properties } = response
    const databaseTitle = response.title[0].text.content

    databaseEnum[databaseTitle] = { id, databaseTitle, properties }
  }

  spinner.stop()

  return databaseEnum
}

async function addBlankTask(db) {
  const taskTitle = await getTaskTitle().catch(e => {
    throw new Error("Unable to retrieve task title", e)
  });

  spinner.start();

  const response = await notion.pages.create({
    parent: { database_id: db.id, type: "database_id" },
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
          start: `${new Date().toISOString().substring(0, 10)}`
        }
      },
      Status: {
        checkbox: false
      }
    }
  }).catch(error => {
    spinner.fail(chalk.red('Something went wrong'));
    throw new Error(error)
  });

  spinner.succeed(chalk.green('Success! Task added.'));
  console.log(chalk.green(response.url));
}


async function addTemplateTask(db) {
  const template = await getTaskTemplate();
  const taskTitle = await getTaskTitle();

  spinner.start();

  const response = await notion.pages.create({
    parent: { database_id: db.id, type:'database_id' },
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
      Status: {
        checkbox: false
      },
      Date: {
        date: {
          start: `${new Date().toISOString().substring(0, 10)}`
        }
      }
    }
  }).catch((error) => {
    spinner.fail(chalk.red('Something went wrong'));
    throw new Error(error)
  })

  spinner.succeed(chalk.green('Success! Task added.'));
  console.log(chalk.green(response.url));
}


async function getTasks(db) {
  spinner.start("Fetching your tasks ....")

  const response = await notion.databases.query({
    database_id: db.id,
    filter:{
      property: "Date",
      date: {
        equals: `${new Date().toISOString().substring(0, 10)}`
      }
    }
  }).catch((error) => {
    spinner.fail("There was an error fetching tasks")
    throw new Error(error)
  })

  spinner.succeed(chalk.green("Success! Here are your tasks: \n"))

  return response 
}

async function markTaskComplete(task) {
  spinner.start("Updating task ....")

  const response = await notion.pages.update({
    page_id: task.id,
    properties: {
      Status: {
        checkbox: true
      }, 
    }
  }).catch(error => {
    spinner.fail(chalk.red('Something went wrong'));
    throw new Error(error)
  });

  spinner.succeed(chalk.green("Success! Here is your task: \n"))
  return console.log(chalk.green(response.url))  
}

async function deleteTask(task) {
  const confirmDelete = await confirmDeletePrompt()

  if(confirmDelete) {
    spinner.start("Deleting task ....")
    await notion.pages.update({
      page_id: task.id,
      archived: true
    }).catch(error => {
      spinner.fail(chalk.red('Something went wrong'));
      throw new Error(error)
    });
    
    return spinner.succeed(chalk.green("Your task was successfully deleted"))
  } else {
    console.log("Got it! Shutting Down ...")    
    process.exit(0)
  }
 
}

async function updateTaskTitle(task) {
  
  const taskTitle = await getTaskTitle(update = true)

  spinner.start("Updating task title ....")
  
  const response = await notion.pages.update({
    page_id: task.id,
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
    }
  }).catch(error => {
    spinner.fail(chalk.red('Something went wrong'));
    throw new Error(error)
  });

  spinner.succeed(chalk.green("Success! Here is your updated task: \n"))
  return console.log(chalk.green(response.url));
}

async function updateWithSelectedAction (task) {

  const updateActionTypeEnum = {
    "Mark as complete": markTaskComplete,
    "Delete Task": deleteTask,
    "Change Task Title": updateTaskTitle
  }

  //Return one of ["Mark as complete", "Delete Task", "Change Task Title"]
  const selectedUpdateAction = await updateActionPrompt()

  updateActionTypeEnum[selectedUpdateAction](task)
}
module.exports = { getDatabases, addBlankTask, addTemplateTask, getTasks, updateWithSelectedAction }


