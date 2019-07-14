module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.body) {

        let imports = req.body[0];
        let existing = req.body[1].data.transactions;

        let deltaImports = [];

        //we want to return the transactions that dont exist yet
        //we will do a comparison based off date, memo, and amount

        for (let i = 0; i < imports.length; i++) {
            let foundMatch = false;
            for (let x = 0; x < existing.length; x++) {
                if (existing[x].date == imports[i].date
                    && existing[x].memo == imports[i].memo
                    && existing[x].amount == imports[i].amount) {

                    //found a match, remove from the list
                    context.log("Match!");
                    context.log("existing date: " + existing[x].date);
                    context.log("import date: " + imports[i].date);
                    foundMatch = true;
                }
            };
            context.log("foundMatch: " + foundMatch);
            if (!foundMatch) {
                deltaImports.push(imports[i]);
            }
        };


        context.res = {
            // status: 200, /* Defaults to 200 */
            body: deltaImports
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass existing transactions and new transactions in the request body"
        };
    }
};