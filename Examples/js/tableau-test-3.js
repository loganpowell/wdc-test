(function() {
  // Create the connector object
  var myConnector = tableau.makeConnector();

  // get path from URL
  // var location = window.location;
  // var hashString = String(location.hash)
  // var page = hashString.replace("#", "")
  // console.log("page: " + page)
    // console.log("console.log => location: " + location)
    // console.log("hash => " + location.hash)
    // console.log("host => " + location.host)
    // console.log("hostname => " + location.hostname)
    // console.log("href => " + location.href)
    // console.log("pathname => " + location.pathname)
    // console.log("port => " + location.port)
    // console.log("protocol => " + location.protocol)
    // console.log("search => " + location.search)
    // console.log("replace => " + location.replace)
    // console.log("assign => " + location.assign)
    // console.log("reload => " + location.reload)

/*
location object:

window.location = {
	hash: '#myAnchor',
	host: 'davidwalsh.name',
	hostname: 'davidwalsh.name',
	href: 'https://davidwalsh.name:80/article.php?s=david+walsh+blog#myAnchor',
	pathname: '/article.php',
	port: '80',
	protocol: 'http:',
	search: '?s=david+walsh+blog',
	replace: 'function replace() { [native code] }',
	assign: 'function assign() { [native code] }',
	reload: 'function reload() { [native code] }'
}

log.txt file

HASHLESS:

console.log => location:
hash =>
host => loganpowell.github.io
hostname => loganpowell.github.io
href => https://loganpowell.github.io/wdc-granicus/index.html?testing-location&parameters:with-colons%20spaces=and?querys=reques
pathname => /wdc-granicus/index.html
port =>
protocol => https:
search => ?testing-location&parameters:with-colons%20spaces=and?querys=request
replace => function replace() {\n    [native code]\n}
assign => function assign() {\n    [native code]\n}
reload => function reload() {\n    [native code]\n}


HASH IN CENTER OF URL:

console.log => location:
hash => #hash&parameters:with-colons%20spaces=and?querys=request
host => loganpowell.github.io
hostname => loganpowell.github.io
href => https://loganpowell.github.io/wdc-granicus/index.html?testing-location#hash&parameters:with-colons%20spaces=and?querys=request
pathname => /wdc-granicus/index.html
port =>
protocol => https:
search => ?testing-location
replace => function replace() {\n    [native code]\n}
assign => function assign() {\n    [native code]\n}
reload => function reload() {\n    [native code]\n}

HASH AT END OF Url:

log => location:
hash => #hash
host => loganpowell.github.io
hostname => loganpowell.github.io
href => https://loganpowell.github.io/wdc-granicus/index.html?testing-location&parameters:with-colons%20spaces=and?querys=request#hash
pathname => /wdc-granicus/index.html
port =>
protocol => https:
search => ?testing-location&parameters:with-colons%20spaces=and?querys=request
replace => function replace() {\n    [native code]\n}
assign => function assign() {\n    [native code]\n}
reload => function reload() {\n    [native code]\n}

*/

  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //jan = 0
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();
  var newdate = year + "-" + month + "-" + day;

  var fortnightPrior = new Date(Date.now() - 12096e5);
  var fnPmonth = fortnightPrior.getUTCMonth() + 1;
  var fnPday = fortnightPrior.getUTCDate();
  var fnPyear = fortnightPrior.getUTCFullYear();
  var fnPnewdate = fnPyear + "-" + fnPmonth + "-" + fnPday;

  // Define the schema
  myConnector.getSchema = function(schemaCallback) {
    var cols = [
      {
        id: "code",
        dataType: tableau.dataTypeEnum.string
      },
      {
        id: "name",
        // alias: "Bulletins Sent",
        dataType: tableau.dataTypeEnum.string
      },
      {
        id: "bulletins_sent_this_period",
        // alias: "",
        dataType: tableau.dataTypeEnum.int
      },
      {
        id: "bulletins_sent_to_date",
        // alias: "",
        dataType: tableau.dataTypeEnum.int
      },
      {
        id: "new_subscriptions_this_period",
        // alias: "",
        dataType: tableau.dataTypeEnum.int
      },
      {
        id: "new_subscriptions_to_date",
        // alias: "",
        dataType: tableau.dataTypeEnum.int
      },
      {
        id: "visibility",
        // alias: "",
        dataType: tableau.dataTypeEnum.string
      },
      {
        id: "total_subscriptions_to_date",
        // alias: "",
        dataType: tableau.dataTypeEnum.int
      },
      {
        id: "deleted_subscriptions_this_period",
        // alias: "",
        dataType: tableau.dataTypeEnum.int
      },
      {
        id: "deleted_subscriptions_to_date",
        dataType: tableau.dataTypeEnum.int
      }
    ];

    var schemas = {
      id: "Granicus_Subscriptions",
      alias:
        "Granicus subscriptions, deletions and bulletins for start_date: " +
        fnPnewdate +
        " - end_date: " +
        newdate,
      columns: cols
    };
    schemaCallback([schemas]);
  };

  // Download the data
  myConnector.getData = function(table, doneCallback) {
    // var dates = tableau.connectionData.split(';')[1];

    var apiCall =
      "https://cors-anywhere.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/11723/reports/topics?end_date=" +
      newdate + "&start_date=" + fnPnewdate + "&page=" + JSON.parse(tableau.connectionData)['page'];

    // tableau.log("dates: " + dates);
    tableau.log("api call: " + apiCall);

    $.ajax({
      url: apiCall,
      type: "GET",
      dataType: "json",
      success: function(resp) {
        tableau.log("resp: " + resp);
        var results = resp.topic_details;
        table.appendRows(
          results.map(function(result) {
            return {
              code: result.code,
              name: result.name,
              visibility: result.visibility,
              bulletins_sent_this_period: result.bulletins_sent_this_period,
              bulletins_sent_to_date: result.bulletins_sent_to_date,
              deleted_subscriptions_this_period:
                result.deleted_subscriptions_this_period,
              deleted_subscriptions_to_date:
                result.deleted_subscriptions_to_date,
              new_subscriptions_this_period:
                result.new_subscriptions_this_period,
              new_subscriptions_to_date: result.new_subscriptions_to_date,
              total_subscriptions_to_date: result.total_subscriptions_to_date
            };
          })
        );
        doneCallback();
      },
      error: function() {
        console.log("error in ajax call!");
      },
      beforeSend: setHeader
    });
  };

  function setHeader(xhr) {
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("x-auth-token", tableau.password);
    xhr.setRequestHeader("accept", "application/hal+json");
  }

  tableau.registerConnector(myConnector);

  // Create event listeners for when the user submits the form
  $(document).ready(function() {
    $("#submitButton").click(function() {
      var location = window.location;
      var hashString = String(location.hash)
      var page = hashString.replace("#", "")

      // console.log("page: " + page)

      tableau.connectionData = JSON.stringify({'page': page})
      var key = $("#key").val();
      if (key) {
        tableau.password = key; // Use this variable to pass data to your getSchema and getData functions
        tableau.connectionName = "Granicus API"; // This will be the data source name in Tableau
        tableau.submit(); // This sends the connector object to Tableau
      } else {
        alert("Enter a valid Granicus API key");
      }
    });
  });
})();
