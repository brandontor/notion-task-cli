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
          start: `${new Date().toISOString()}`
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
          start: `${new Date().toISOString()}`
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

module.exports = { getDatabases, addBlankTask, addTemplateTask }


