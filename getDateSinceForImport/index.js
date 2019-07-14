module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.body) {

        var transactions = req.body;

        let oldestDate = new Date();

        transactions.forEach(element => {
            if(element.date > oldestDate){
                oldestDate = element.date;
            }
        }); 

        let year = oldestDate.getFullYear();
        let month = oldestDate.getMonth();
        let day = oldestDate.getDate();

        if(month < 10){
            month = "0" + month;
        }
        if(day < 10){
            day = "0" + day;
        }

        let dateString = year + "-" + month + "-" + day;

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: dateString
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass transactions in request body"
        };
    }
};