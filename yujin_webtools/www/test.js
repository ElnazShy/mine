
define(["dojo/_base/declare","dijit/_WidgetBase","dijit/form/Button","ros/ros","dojo"],
        function(declare,widgetbase,Button,ROS) {
        var b = declare("yujin_webtools.test",[widgetbase,Button],{
                label:"Hello",

                postCreate : function() {
                    this.ros = new ROS('ws://localhost:9090');
                    dojo.global.ros = this.ros;
                    console.log(this.ros);
                },

                onClick: function(evt) {
                    console.log("here");
                },
            });
            return b;
        }
);

