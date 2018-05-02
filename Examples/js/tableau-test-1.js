(function () {
  var myConnector = tableau.makeConnector();

  let dateObj = new Date(),
      month = dateObj.getUTCMonth() + 1, //jan = 0
      day = dateObj.getUTCDate(),
      year = dateObj.getUTCFullYear(),
      newdate = year + "-" + month + "-" + day;

  let fortnightPrior = new Date(Date.now() - 12096e5),
      fnPmonth = fortnightPrior.getUTCMonth() + 1
      fnPday = fortnightPrior.getUTCDate(),
      fnPyear = fortnightPrior.getUTCFullYear(),
      fnPnewdate = fnPyear + "-" + fnPmonth + "-" + fnPday;

  console.log({
    "newdate" : newdate,
    "fnPnewdate" : fnPnewdate
  })

  let key = ""

  myConnector.init = function(initCallback) {
      tableau.authType = tableau.authTypeEnum.basic;
      key = tableau.password
      console.log("key: " + key)
      initCallback();
  }

  myConnector.getSchema = function (schemaCallback) {
    var cols = [{
          id: "code",
          dataType: tableau.dataTypeEnum.string
      }, {
          id: "name",
          // alias: "Bulletins Sent",
          dataType: tableau.dataTypeEnum.string
      }, {
          id: "bulletins_sent_this_period",
          // alias: "",
          dataType: tableau.dataTypeEnum.int
      }, {
          id: "bulletins_sent_to_date",
          // alias: "",
          dataType: tableau.dataTypeEnum.int
      }, {
          id: "new_subscriptions_this_period",
          // alias: "",
          dataType: tableau.dataTypeEnum.int
      }, {
          id: "new_subscriptions_to_date",
          // alias: "",
          dataType: tableau.dataTypeEnum.int
      }, {
          id: "visibility",
          // alias: "",
          dataType: tableau.dataTypeEnum.string
      }, {
          id: "total_subscriptions_to_date",
          // alias: "",
          dataType: tableau.dataTypeEnum.int
      }, {
          id: "deleted_subscriptions_this_period",
          // alias: "",
          dataType: tableau.dataTypeEnum.int
      }, {
          id: "deleted_subscriptions_to_date",
          dataType: tableau.dataTypeEnum.int
      }]


      var tableSchema = {
          id: "Granicus_Subscriptions",
          alias: `Granicus subscriptions, deletions and bulletins for start_date: ${fnPnewdate} - end_date: ${newdate}`,
          columns: cols
      };

      schemaCallback([tableSchema]);
  };

  myConnector.getData = function(table, doneCallback) {
    fetch(`https://cors-anywhere.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/11723/reports/topics?end_date=${newdate}&start_date=${fnPnewdate}&page=1`, {
      headers: {
        'content-type': 'application/json',
        'x-auth-token': key,
        'accept': 'application/hal+json'
       }
    })
    .then(r => r.json()).then(json => {
      let results = json.topic_details
      tableData = []
      for (let i = 0, l = results.length; i < l; i++) {
        tableData.push({
          "code": results[i].code,
          "name": results[i].name,
          "visibility": results[i].visibility,
          "bulletins_sent_this_period": results[i].bulletins_sent_this_period,
          "bulletins_sent_to_date": results[i].bulletins_sent_to_date,
          "deleted_subscriptions_this_period": results[i].deleted_subscriptions_this_period,
          "deleted_subscriptions_to_date": results[i].deleted_subscriptions_to_date,
          "new_subscriptions_this_period": results[i].new_subscriptions_this_period,
          "new_subscriptions_to_date": results[i].new_subscriptions_to_date,
          "total_subscriptions_to_date": results[i].total_subscriptions_to_date
      })
    }
    table.appendRows(tableData)
    doneCallback()
  })
}

  tableau.registerConnector(myConnector);

  $(document).ready(function () {
    $("#submitButton").click(function () {
      tableau.connectionName = "Granicus";
      tableau.submit();
    });
  });

})();
