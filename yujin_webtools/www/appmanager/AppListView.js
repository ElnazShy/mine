/* 
   Jihoon Lee
    Date : 10.04.2012
 */

define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dojo/dom-style",
        "dojox/grid/DataGrid",
        "dojo/data/ItemFileWriteStore",
        "dijit/form/Button",
        "yujin_webtools/widgets/Loader",
        "dijit/Tooltip",
        ],
function(declare,widgetbase,domStyle,DataGrid,Store,Button,Loader,Tooltip)
{
    var AppListView = declare("appmanager.AppListView",[widgetbase],
        {
            updateAppListSrv_name : '/get_applist',
            updateAppListSrv_type : '/',


            postCreate : function() {
                Loader.loadCSS("dojox/grid/resources/Grid.css");
                Loader.loadCSS("dojox/grid/resources/claroGrid.css");
        
                this.updateAppListSrv = new ros.Service({
                    name : this.updateAppListSrv_name,
                    type: this.updateAppListSrv_type,
                });
                this.srvRequest = new ros.ServiceRequest({});

                this.createDataGrid();
                this.createButton();

                ros.on('error',function(e) { console.log(e);});
                this.updateAppList();
            },

            createDataGrid : function() {
                var data = this.createData([]); 

                var that = this;
                var layout = [ {name : "Name", field : "name"}];

                
                this.currentStore = new Store({data:data}); 

                this.grid = new DataGrid({
                    id: 'grid',
                    store : this.currentStore,
                    structure :layout,
                    rowSelector : '20px'
                    });
                domStyle.set(this.grid.domNode,"height","300px");
                domStyle.set(this.grid.domNode,"width","95%");
                domStyle.set(this.domNode,"margin","10px");

                this.domNode.appendChild(this.grid.domNode);
                this.grid.startup();
            },

            createButton : function() {
                this.button = new Button({label:"Get App lists"});
                this.connect(this.button,"onClick","updateAppList");
                this.domNode.appendChild(this.button.domNode);
            },

            updateAppList : function() {
                var that = this;
                this.button.setAttribute('disabled',true);
                this.updateAppListSrv.callService(this.srvRequest,function(result) {
                    var data = that.createData(result.app_names);
                    that.currentStore.close();
                    that.currentStore = new Store({data:data});
                    that.grid.setStore(that.currentStore);
                    that.button.setAttribute('disabled',false);

                    Tooltip.show("Updated",that.button.domNode);
                    window.setTimeout(function() {  Tooltip.hide(that.button.domNode);  },1000);
                });
            },

            createData : function(names) {
                var data = {
                    identifier : 'name',
                    items : [],
                };
                
                for( n in names) { 
                    var i = { name : names[n]};
                    data.items.push(i);
                }
                return data;
            },
        });
    return AppListView;
}
);
