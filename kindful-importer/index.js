var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const request = require('request');
const csv = require('csvtojson');


module.exports = async function (context, req) {

    // Connection configuration to SQL server.
    const config = {  
        server: 'focolare-na-data.database.windows.net',
        authentication: {
            type: 'default',
            options: {
                userName: 'focolare-na-data', //update me
                password: '2S4FXXata6vNYtg'  //update me
            }
        },
        options: {
            // If you are on Microsoft Azure, you need encryption:
            encrypt: true,
            database: 'kindful-test'  //update me
        }
    };
    
    const csv_url = (req.query.csv_url || (req.body && req.body.csv_url));
    if(req && req.body && req.body.data && req.body.data.object)
        csv_url = req.body.data.object.csv_url;

    parseCSV(csv_url).then(msg => {
        console.log(msg);
    });

    async function parseCSV(csv_url){
        let rowCount = 0;

        // convert csv to json
        return new Promise((resolve,reject)=>{
            csv()
            .fromStream(request.get(csv_url))
            .subscribe((json)=>{
                let sqlQuery = "INSERT INTO [dbo].[activities] (";
                let colQuery = "";
                let valueQuery = "";
                for (let header in json){
                    // parse
                    // 1. remove string after '/'
                    // 2. replace the space to '_'
                    // 3. remove other symbols
                    let newHeader = parseColumnName(header);
                    colQuery += newHeader;
                    colQuery += ",";

                    valueQuery += "'";
                    valueQuery += json[header].replace("'","''");
                    valueQuery += "',";
                }
                
                sqlQuery += colQuery.substring(0, colQuery.length - 1);
                sqlQuery += ") VALUES (";
                sqlQuery += valueQuery;
                sqlQuery = sqlQuery.substring(0, sqlQuery.length - 1);
                sqlQuery += ")";
                

                // Initialize the connection
                let connection = new Connection(config);
                // Setup event handler when the connection is established. 
                connection.on('connect', function(err) {
                    if(err) {
                        console.error('Error: ', err);
                        return;
                    }
                    connection.execSql(new Request(sqlQuery, function(err) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        rowCount++;
                    }));
                });
                connection.connect();
                connection.close();
            });
            resolve('Inserted successfully ', rowCount, ' records.');
        });
    }

    function parseColumnName(header) {
        let pos = header.indexOf("/");
        let newHeader;
        if (pos != -1) {
            newHeader = header.substring(0, pos);
        }
        else {
            newHeader = header;
        }
        newHeader = newHeader.replace(/\s/gm, '_');
        newHeader = newHeader.replace(/[^\w]/gm, '');
        newHeader = newHeader.toLowerCase();
        return newHeader;
    }
}
