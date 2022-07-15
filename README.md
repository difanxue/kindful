# kindful
Create an Azure function to automatically insert the csv file data from the into azure sql database. Using NodeJS, tedious, csvtojson to implement that.

## How to run it in local?
1. Open the project in the VS Code. Please make sure you have alreaday installed the environment including Azure core tools. The instruction:https://docs.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-node
2. Run the function locally. 
  Start the index.js (localated in kindful->kindful-importer-test->index.js) by Press F5.
  Execute the functions kindful-importer-test (leftside bar -> azure -> worksapce).
  Enter the request body. e.g. { "csv_url": "https://raw.githubusercontent.com/difanxue/kindful-data/main/kindful_activities_sample_copy-1.csv" }

## Dependencies
NodeJS
Request
Tedious
