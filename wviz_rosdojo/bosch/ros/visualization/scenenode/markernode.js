/**
 * @class MarkerNode
 * @brief Class that helps visualizing markers.
 * @details An object of this class keeps necessary variables to visualize a map of type visualization_msgs/Marker
 */
ros.visualization.MarkerNode = ros.visualization.SceneNode.extend({
    /**
     * Constructor.
     * @param vm visualization manager. An instance of the class defined in rosjs_visualization/js/visualization/visualizationmanager.js.
     * @param args An array of arguments. Currently only 1 argument is used: args[0]: a topic that publishes visualization_msgs/Marker messages.
     */
    init: function(vm,args){
	this.vm = vm;
	this.topic = "";
	this.redraw = 0;
	this.msgType = "visualization_msgs/Marker";
	this.keys = {"topic":this.topic};
	this.name = "";
	this.oldTopic = "";
	this.marker_manager = this.vm.marker_manager;

	// args[0] is the topic to subscribe
	if(args[0] != 'undefined' && args[0] != 'null'){
	    this.marker_manager.subscribeMarker(args[0]);
	}
	this.marker_id='';
	this.node_id='';
    },
    /**
     * Unsubsribe from the old topic and subsribe to a new topic.
     * @param newTopic the new topic to which we would like to subscribe.
     */
    changeTopic: function(newTopic){
	var that = this;
    	this.unsub();
    	this.marker_manager.subscribeMarker(newTopic,function(msg){that.updateFromMessage(msg);});
	this.oldTopic = this.topic;
	this.topic = newTopic;
    },
    /**
     * Unsubscribe from 'topic' and delete the marker model from the scene.
     */
    unsub: function(){
	// First unsubscribe from the topic so that rosjs does not trigger the callback.
	this.vm.node.unsubscribe(this.topic);

	// Since markers don't have a model, we will destroy the node here.
	//
	// Get the node_id
	var n_id = this.marker_manager.markerNodes.find(this.marker_id);
	// We already know the marker_id; we can remove the marker
	this.marker_manager.removeMarker(n_id, this.marker_id);
    },
    /**
     * Gets the message in, extracts the marker id from it, and then passes it in to marker manager.
     * @param msg a ROS marker message of type visualization_msgs/Marker
     */
    updateFromMessage: function(msg){
	// You can do something with the message here
	// Then pass it to somewhere you want
	
	// Let's keep a copy of the message id (for when we want to remove the scene node), 
	this.marker_id = this.marker_manager.getMarkerStringID(msg);
	
	// then convery the message to marker_manager	
	this.marker_manager.receiveMarkerMessage(msg);
    }
});