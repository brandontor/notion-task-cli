/*

	*Various Notion API helpers for common requests

*/
const chalk = require('chalk');
const ora = require('ora');
const { Client } = require('@notionhq/client');
const { getTaskTitle } = require ('./promptHelper')


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

       const {id, properties} = response
       const databaseTitle = response.title[0].text.content
       
       databaseEnum[databaseTitle] = {id, databaseTitle, properties}
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
			parent: { database_id: db.id, type: "database_id"},
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

module.exports = {getDatabases, addBlankTask}



// async function addTemplateTask() {
// 	const template = await getTaskTemplate();
// 	const taskTitle = await getTaskTitle();

// 	spinner.start();

// 	try {
// 		await notion.pages.create({
// 			parent: { database_id: process.env.NOTION_TASK_DATABASE_ID },
// 			icon: template.icon,
// 			properties: {
// 				title: {
// 					title: [
// 						{
// 							text: {
// 								content: taskTitle
// 							}
// 						}
// 					]
// 				},
// 				Date: {
// 					date: {
// 						start: `${new Date().toISOString()}`
// 					}
// 				}
// 			}
// 		});

// 		const getDailyPlannerURL = await notion.pages.retrieve({
// 			page_id: process.env.NOTION_DAILY_PLANNER_PAGE_ID
// 		});

// 		spinner.succeed(chalk.green('Success! Task added.'));
// 		console.log(chalk.green(getDailyPlannerURL.url));
// 	} catch (e) {
// 		spinner.fail(chalk.red('Something went wrong'));
// 		console.log(e);
// 	}
// }