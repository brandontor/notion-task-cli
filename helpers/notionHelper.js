/*

  *Various Notion API helpers for common requests

*/
const chalk = require('chalk');
const ora = require('ora');
const { Client } = require('@notionhq/client');
const { getTaskTitle, getTaskTemplate } = require('./promptHelper')


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
  if (response.results.length > 0) {
    response.results.forEach((task) => {
      const result = {
        emoji: task.icon.emoji,
        title: task.properties.Name.title[0].plain_text,
        status: task.properties.Status.checkbox ? `[ x ]` : `[ ]`
      }
      console.log(`${result.emoji} ${result.title}`, chalk.dim(result.status))
    })
  } else {
    console.log("No tasks available")
  }
}

module.exports = { getDatabases, addBlankTask, addTemplateTask, getTasks }


