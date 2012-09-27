
define(["dojo/_base/declare","dijit/_WidgetBase","dijit/_TemplatedMixin","dojo/dom-class","robotwebtools_amd/tools/nav2d",
        "dojo/text!./templates/NavigationUI.html","./Loader","dijit/form/Button","dojo/on"
        ],
function(declare,widgetbase,_TemplatedMixin,domClass,Nav2D,template,loader,Button,on)
{
    var b = declare("yujin_webtools.widgets.NavigationUI",[widgetbase,_TemplatedMixin],{
        templateString : template,
        canvaswidth :  640,
        canvasheight: 480,

        postCreate : function() {
            loader.loadCSS("yujin_webtools/widgets/css/navui.css");
            this.navcanvas.width = this.canvaswidth;
            this.navcanvas.height = this.canvasheight;
            this.navcanvas.id = this.id+"_navcanvas";
            this.nav2d = new Nav2D({
                ros:ros,
                canvasID:this.navcanvas.id,
                width:this.navcanvas.width,
                height:this.navcanvas.height
            });

            this.initPoseButton = new Button({}, this.initPoseAttach);
            this.setGoalButton = new Button({},this.setGoalAttach);
            this.cancelGoalButton = new Button({},this.cancelGoalAttach);

            on(this.initPoseButton,"click",this.initPoseClicked);
            on(this.setGoalButton,"click",this.setGoalClicked);
            on(this.cancelGoalButton,"click",this.cancelGoalClicked);
        },
        
        startup : function() {
        },

        initPoseClicked : function(e)
        {
            console.log("init pose clicked");
        },
            
        setGoalClicked : function(e)
        {
            console.log("SetGoal Clicked!");
        },

        cancelGoalClicked : function(e)
        {
            console.log("Cancel Goal!");
        },
    });
    return b;

}
);
