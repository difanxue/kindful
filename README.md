# kindful-importer
An Azure function that imports data from a CSV file to an Azure SQL Database (MS SQL Server). 
The code was designed to be deployed as an Azure function and to be triggered by HTTP requests.
It was intended to be triggered by a webhook in Kindful for Scheduled reports.
Implemented using NodeJS, tedious, csvtojson.

# Pre-requisites
- VS Code
- VS Code Extension: Azure core tools ([how to](https://docs.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-node))

# Environment variable
How to set environment variables:
1. For local development go to your local.settings.json file and append the following environment variables to your "Values" object
2. For cloud deployment, go to Azure portal and on your function add the following environment variables to the Application settings tab ([how to](https://docs.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings?tabs=portal#settings))

Configure the following environment variables and some examples:
- "DB_SERVER": "your-server-name.database.windows.net",
- "DB_USERNAME": "user_name",
- "DB_PASSWORD": "password",
- "DB_DATABASE": "database",
- "DB_TABLE_NAME": "[dbo].[activities]",
- "DB_IMPORT_LOG_TABLE_NAME": "[dbo].[import_log]"

## How to run it in local?
1. Clone project in VS Code.
2. Run "npm install" to download the dependencies (the folder "node_modules" will be created in the root of the project which will store the dependencies)
3. To run the function locally:
  Start the index.js (located in kindful->kindful-importer->index.js) by Pressing F5.\
  This will initialize a server that will be listening to HTTP requests.
  Execute the function kindful-importer (leftside bar -> azure -> workspace).\
  Enter the request body. e.g.\
    { "data": {"object": {"csv_url": "https://csantos-20220731-tmp.s3.us-west-2.amazonaws.com/Activities27.csv"}}}

## How to deploy the function to the cloud?
1. You first need to create an Azure function in Azure cloud
2. On VS Code, go to the Azure on the left side bar
3. On the view workspace, you should see your function under Local Project -> Functions
4. Hover the mouse over the viw title (Workspace) and you should see some icons appear on the right side of the title
5. The second icon is "Deploy...". Click on it and choose which cloud function you want to deploy it to
6. For more info [click here](https://docs.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-node#deploy-the-project-to-azure)

## References
https://github.com/Keyang/node-csvtojson/blob/master/docs/csvtojson-v2.md#add-promise-and-async--await-support
https://tediousjs.github.io/tedious/api-datatypes.html
https://github.com/tediousjs/tedious/blob/master/examples/minimal.js
https://github.com/tediousjs/tedious/blob/master/examples/bulk-load.js
https://tediousjs.github.io/tedious/api-connection.html#function_execBulkLoad
