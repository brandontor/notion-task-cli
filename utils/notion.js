// const {createInterface} = require('readline')
const { Client } = require('@notionhq/client');
const inquirer = require('inquirer')

const readline = createInterface({
    input: process.stdin,
    output: process.stdout
})

const readLineAsync = msg => {
    return new Promise(resolve => {
      readline.question(msg, userRes => {
        resolve(userRes);
      });
    });
  }

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_TASK_DATABASE_ID


async function addItem(text) {
    try {
      const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          title: {
            title:[
              {
                "text": {
                  "content": text
                }
              }
            ]
          },

        },
      })
      console.log(response)
      console.log("Success! Entry added.")
    } catch (error) {
      console.error(error.body)
    }
}

async function getTemplate(text) {
  try{

    const response = await notion.databases.retrieve({
      database_id: process.env.NOTION_TASK_DATABASE_ID,
    })

    const pages = await notion.databases.query({
      filter:{}
    })

    console.log(response)

  } catch(e) {
    console.log(e)
  }
}

const templateEnum = [
  "Coding",
  "House Keeping",
  "Social",
  "Side Hustle",
  "Schedule/Reflection",
  "Work",
  "No Template"
]

module.exports = async function notion() {


    const userRes = await readLineAsync(`What is your task title?\r\n`);
    console.log("")
    addItem(userRes)
    readline.close()
    // getTemplate()
}