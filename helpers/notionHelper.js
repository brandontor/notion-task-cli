/*

	*Various Notion API helpers for common requests

*/
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_KEY });

async function getDatabases() {
	const databases = await notion.search({
        filter: {
            property: "object",
            value: "database"
        }
    })

    const databaseEnum = {}

    for (let database of databases.results) {
       const response = await notion.databases.retrieve({
         database_id: `${database.id}`
       })

       const {id} = response
       const databaseTitle = response.title[0].text.content
       
       databaseEnum[databaseTitle] = {id, databaseTitle}
    }

    return databaseEnum
}


module.exports = {getDatabases}