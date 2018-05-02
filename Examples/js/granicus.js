Backbone.sync = (function(syncFn) {
    return function(method, model, options) {
        options = options || {};

        // handle unauthorized error (401)
        options.error = function(xhr, textStatus, errorThrown) {
            if (xhr.status === 401) {
                $('.apiKeyInvalid').show();
            }
        };

        return syncFn.apply(this, arguments);
    };
})(Backbone.sync)

var objectFlatten = function (data) {
    var result = {};

    function recurse(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
            recurse(cur[i], prop + "[" + i + "]");
            if (l == 0) result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + "_" + p : p);
            }
            if (isEmpty && prop) result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}

var tableauType = function(val) {
    if (parseInt(val) == val) return tableau.dataTypeEnum.int;
    if (parseFloat(val) == val) return tableau.dataTypeEnum.float;
    if (isFinite(new Date(val).getTime())) return tableau.dataTypeEnum.datetime;
    return tableau.dataTypeEnum.string;
}

console.log(tableau.connectionData())

(function () {
  var myConnector = tableau.makeConnector();
  myConnector.init = function(initCallback) {
      tableau.authType = tableau.authTypeEnum.basic;
      let key = tableau.password
      console.log("key: " + key)
      initCallback();
  }
  myConnector.getSchema = function (schemaCallback) {
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/11723/reports/topics?end_date="+newdate+"&start_date="+fnPnewdate+"&page=1",
        type: "GET",
        headers: {
          'content-type': 'application/json',
          'x-auth-token': JSON.parse(tableau.connectionData)['apiKey'],
          'accept': 'application/hal+json'
        },
        success: function(response){
          var flatten = objectFlatten(response)
          var columns = []
          for (var key in flatten) {
            var id = key.replace(/[^A-Za-z0-9_]+/g, '')
            columns.push({
              id: id,
              alias: key,
              dataType: tableauType(flatten[key])
            })
          }
          var table = {
            id: "Granicus_Subscriptions",
            alias: "Granicus subscriptions, deletions and bulletins for start_date: "+fnPnewdate+" - end_date: "+newdate,
            columns: columns
          }
          schemaCallback([table]);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            tableau.abortWithError("Unable to get data. Make sure you used proper API key and you have at least one session for selected digger with dataset.");
        }
      });
    };
    myConnector.getData = function (table, doneCallback) {
      $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/11723/reports/topics?end_date="+newdate+"&start_date="+fnPnewdate+"&page=1",
        type: "GET",
        headers: {
          'content-type': 'application/json',
          'x-auth-token': JSON.parse(tableau.connectionData)['apiKey'],
          'accept': 'application/hal+json'
        },
        success: function(response){
          var data = []
          for (var i=0; i < response.length; i++) {
            var flatten = objectFlatten(response[i])
            var rec = {}
            for (var key in flatten) {
              var id = key.replace(/[^A-Za-z0-9_]+/g, '')
              rec[id] = flatten[key]
            }
            data.push(rec)
          }
          table.appendRows(data);
          doneCallback();
        },
        error: function (xhr, ajaxOptions, thrownError) {
          tableau.abortWithError("Unable to get data. Make sure you used proper API key and you have at least one session for selected digger with dataset.");
        }
      });
    };
    tableau.registerConnector(myConnector);

    var Digger = Backbone.Model.extend();
    var DiggersCollection = Backbone.Collection.extend({
      url: 'https://cors-anywhere.herokuapp.com/https://api.govdelivery.com/api/v2',
      model: Digger
    });
    var DiggerItem = Backbone.View.extend({
      tagName: "option",
      initialize: function(){
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
      },
      render: function(){
        this.$el.attr('value', this.model.get('id')).text(this.model.get('name'));
        return this;
      }
    });
    var DiggersView = Backbone.View.extend({
        collection: null,
        el: 'select#digger',
        initialize: function(options){
            this.collection = options.collection;
            _.bindAll(this, 'render');
            this.collection.bind('sync', this.render);
        },
        render: function(){
            console.log('render');
            var element = this.$el;
            element.empty();
            this.collection.each(function(item) {
                var diggerItem = new DiggerItem({
                    model: item
                });
                element.append(diggerItem.render().$el);
            });
            $('#loadDataPanel').hide();
            $('#connectPanel').show();
            return this;
        }
    });

    $(document).ready(function () {
        $("#loadData").click(function () {
            $('.apiKeyInvalid').hide();

            var diggers = new DiggersCollection();
            var diggersView = new DiggersView({collection: diggers});
            diggers.fetch({
                headers: {
                  'Authorization': 'Token ' + $("#apiKey").val()
                }
            });

        });

        $("#connect").click(function () {
            tableau.connectionName = $('#digger option:selected').text();
            tableau.connectionData = JSON.stringify({
                'apiKey': $("#apiKey").val(),
                'diggerID': $('#digger option:selected').val()
            });
            tableau.submit();
        });
    });
})();
