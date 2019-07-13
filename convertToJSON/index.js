const {
    Aborter,
    BlockBlobURL,
    ContainerURL,
    ServiceURL,
    SharedKeyCredential,
    StorageURL
} = require('@azure/storage-blob');

const csvjson = require('csvjson');

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_ACCESS_KEY = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;

const ONE_MEGABYTE = 1024 * 1024;
const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;
const ONE_MINUTE = 60 * 1000;

module.exports = function (context, req) {
    context.log("convertToJSON function processing request");
    if (req.query.blobName) {
        //blob name is in the query params
        let blobName = req.query.blobName;
        context.log("Converting the CSV file named: " + blobName);

        //send is a function which will send the response
        let send = response(context);

        //result is a Promise, not the actual data
        //"then" we give a callback function to send the actual data to 
        getCSVData(blobName)
            .then(
                (content) => {
                    var jsonResult = convert(content);
                    var transformedJSON = transformToYNABType(jsonResult);
                    send(200, transformedJSON);
                });

        context.log("Returning converted data");

    } else {
        context.res = {
            status: 400,
            body: "Please pass blobName"
        };
    }
};

function transformToYNABType(json) {
    json.forEach(element => {
        //date
        var date = convertToISODate(element["Entered Date"]);
        element.date = date;
        delete element["Entered Date"];
        delete element["Effective Date"];

        //memo
        element.memo = element["Transaction Description"];
        delete element["Transaction Description"];

        //amount, uses a funny format where its $1 * 1000
        element.amount = element["Amount"] * 1000;
        delete element["Amount"];

        //balance
        delete element["Balance"];

        //we will worry about adding the other attributes later on in another function

    });
    return json;
}

function convertToISODate(date) {
    return date.split("/").reverse().join("-");
}

function convert(csvString) {

    var options = {
        delimiter: ',', // optional
        quote: '"' // optional
    };

    return csvjson.toObject(csvString, options);

}

//Helper function to build the response
function response(context) {
    return function (status, body) {
        context.res = {
            status: status,
            body: body
        };
        context.done();
    };
}


async function getCSVData(blobName) {

    const containerName = "statements";

    const credentials = new SharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY);
    const pipeline = StorageURL.newPipeline(credentials);
    const serviceURL = new ServiceURL(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, pipeline);

    const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, blobName);

    const aborter = Aborter.timeout(30 * ONE_MINUTE);

    const downloadResponse = await blockBlobURL.download(aborter, 0);

    console.log('Reading response to string...');
    const body = await streamToString(downloadResponse.readableStreamBody);
    console.log(body.length);
    console.log(`Downloaded blob content: "${body}"`);
    return body;
}

async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data.toString());
        });
        readableStream.on('end', () => {
            resolve(chunks.join(''));
        });
        readableStream.on('error', reject);
    });
}

