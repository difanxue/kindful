const intercept = require('azure-function-log-intercept');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const request = require('request');
const csv = require('csvtojson');

// Connection configuration to SQL server.
const config = {
    server: process.env['DB_SERVER'],
    authentication: {
        type: 'default',
        options: {
            userName: process.env['DB_USERNAME'],
            password: process.env['DB_PASSWORD']
        }
    },
    options: {
        encrypt: true,
        database: process.env['DB_DATABASE'],
        trustServerCertificate: true
    }
};

module.exports = async function (context, req) {
    intercept(context);
    context.log('[INFO]', 'HTTP request triggered function execution. context='+JSON.stringify(context, null, 4)+', req='+JSON.stringify(req, null, 4));

    const csv_url = req && req.body && req.body.data && req.body.data.object && req.body.data.object.csv_url;
    if(!csv_url){
        console.error('[ERROR]', 'No csv_url object found in the request body.');
        return;
    }

    // Initialize the connection
    let connection = new Connection(config);

    // Setup event handler when the connection is established. 
    connection.on('connect', function (err) {
        if (err) {
            console.error('[ERROR]', 'Error while trying to connect to the database:', err);
            return;
        }
        
        console.log('[INFO]', 'Processing file', csv_url);

        startImportLog(csv_url, context, connection);
    });

    connection.connect();

    let responseMessage = csv_url;
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };

    await sleep(4000);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function startImportLog(csv_url, context, connection) {
    try {
        const importLogTableName = process.env['DB_IMPORT_LOG_TABLE_NAME'];
        if (importLogTableName) {
            const operation_id = getOperationId(context);

            const sql = `INSERT INTO ${importLogTableName}
                (csv_url, status, operation_id, context, creation_timestamp)
                VALUES
                ('${csv_url}', 'PROCESSING', '${operation_id}', '${JSON.stringify(context)}', SYSDATETIMEOFFSET());`;

            const request = new Request(sql, (error) => {
                if (error) {console.error('[ERROR]', error.errors ? error.errors: error); return; }

                importData(csv_url, connection);
            });

            connection.execSql(request);
        } else {
            importData(csv_url, connection);
        }
    }catch(error) {
        console.error('[ERROR]', error.errors ? error.errors: error);
        connection.close();
    }
}

function importData(csv_url, connection) {
    try {
        let data = [];
        csv()
            .fromStream(request.get(csv_url))
            .subscribe((json) => {
                let jsonConverted = {};
                for (let key in json) {
                    if (key) {
                        jsonConverted[parseColumnName(key)] = json[key];
                    }
                }
                if (jsonConverted['transaction_id'] && jsonConverted['activity_type'] === 'Transaction') {
                    data.push(jsonConverted);
                }
            }, (error) => {
                console.error('[ERROR]', error.errors);
                finalizeImportLog(connection, error);
                connection.close();
            }, () => {
                try{
                    const bulkLoad = connection.newBulkLoad(process.env['DB_TABLE_NAME'], {}, (error, rowCount) => {
                        if (error) { 
                            console.error('[ERROR]', error.errors ? error.errors: error); 
                            finalizeImportLog(connection, error);
                            return; 
                        }

                        console.log('[INFO]', 'Finished processing file. Rows inserted:', rowCount);
                        finalizeImportLog(connection, null);
                    });

                    // setup columns
                    for (let colName in data[0]) {
                        if (colName && !colName.startsWith("field")) {
                            bulkLoad.addColumn(colName, TYPES.VarChar, { length: 255, nullable: colName === 'transaction_id' ? false : true });
                        }
                    }

                    connection.execBulkLoad(bulkLoad, data);
                } catch (error) {
                    console.error('[ERROR]', error.errors ? error.errors: error);
                    finalizeImportLog(connection, error);
                }
            });
    } catch (error) {
        console.error('[ERROR]', error.errors ? error.errors: error);
        finalizeImportLog(connection, error);
    }
}

async function finalizeImportLog(connection, error) {
    const importLogTableName = process.env['DB_IMPORT_LOG_TABLE_NAME'];
    if (importLogTableName) {
        const sql = 'UPDATE ' + importLogTableName
                        + ' SET status = ' + (error ? '\'FAILED\', error = \'' + error.toString().replaceAll("'", "''") + '\'' : '\'SUCCESS\'')
                        + ' WHERE id = (SELECT max(id) from ' + importLogTableName + ')';

        const request = new Request(sql, (error) => {
            if(error) {console.error('[ERROR]', error.errors ? error.errors: error);}

            connection.close();
        });

        connection.execSql(request);
    }
}

/*
 * Description:
 * 1. removes string after '/'
 * 2. replaces the space to '_'
 * 3. removes other symbols
 */
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

function getOperationId(context) {
    const traceparent = context.traceContext && context.traceContext.traceparent;
    if(traceparent){
        let start = traceparent.indexOf('-')+1;
        let end = traceparent.indexOf('-', start);
        return traceparent.substring(start, end);
    } else{
        return context.invocationId;
    }
}