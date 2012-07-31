ros.visualization.MarkerArrayNode = ros.visualization.SceneNode.extend({
    init: function(vm,args){
	this.vm = vm;
	this.topic = "";
	this.redraw = 0;
	this.msgType = "visualization_msgs::MarkerArray";
	this.keys = {"topic":this.topic};
	this.name = "";
    },
);