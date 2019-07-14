module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.body) {

        let transactions = req.body;

        


        transactions.forEach(transaction => {
            transaction["account_id"] = "62923a85-8e3a-4e5f-9083-1005b2330486";
        });

        var parentHolder = {transactions: transactions};
            
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: parentHolder
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
};