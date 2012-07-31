/**
 * @class InteractiveMarkerNode
 * @brief Creates a scene node for one or a group of interactive markers.
 * @details Creates a scene node for one or a group of interactive markers (markers with which users can interact with mouse clicks). Provides methods to handle topic changes.
 */
ros.visualization.InteractiveMarkerNode = ros.visualization.SceneNode.extend({
    /**
     * Constructor. Sets default values and tells Interactive Marker Manager to subscribe to a topic.
     * @param vm Visualization Manager. An instance of the class defined in rosjs_visualization/js/visualization/visualizationmanager.js.
     * @param args An array of input arguments. For now only args[0] is used (interactive marker topic to subscribe e.g. /basic_controls/update).
     */
    init: function(vm,args){
        this.vm = vm;
	this.topic = "";
	this.fullTopic = "";
	this.redraw = 0;
	this.msgType = "visualization_msgs/InteractiveMarker";
	this.keys = {"topic":this.topic};
	this.name = "";
	this.oldTopic = "";
	this.oldFullTopic = "";
	this.interactiveMarkerManager = this.vm.interactive_marker_manager;
	
	// args[0] is the topic to subscribe
	if(args[0] != 'undefined' && args[0] != 'null'){
	    this.interactiveMarkerManager.subscribeInteractiveMarker(args[0]);
	}
	this.imarkerId='';
    },
    /**
     * Unsubsribe from the old topic and subsribe to a new topic.
     * @param newTopic the new topic to which we would like to subscribe.
     */
    changeTopic: function(newTopic){
	var that = this;
    	this.unsub();
	this.interactiveMarkerManager.subscribeInteractiveMarker(newTopic,function(msg){that.updateFromMessage(msg);});
	this.oldTopic = this.topic;
	this.oldFullTopic = this.fullTopic;
	this.topic = newTopic;
	this.fullTopic = newTopic + '_full';
    },
    /**
     * Unsubscribe from 'topic' (e.g. /basic_controls/update) and 'fullTopic' (e.g. /basic_controls/update_full).
     */
    unsub: function(){
	// First unsubscribe from the topic so that rosjs does not trigger the callback.
	this.vm.node.unsubscribe(this.fullTopic);
	this.vm.node.unsubscribe(this.topic);
	this.interactiveMarkerManager.updater.eraseMarkers(this.imarkerId);
    },
    /**
     * Gets the message in, manipulates or extracts information from it, then passes it back to interactive marker manager's updater object.
     * @param msg a ROS message of type visualization_msgs/InteractiveMarker
     */
    updateFromMessage: function(msg){
	// You can do something with the message here
	// Then pass it to somewhere you want
	
	// Let's keep a copy of the message id (for when we want to remove the scene node), 
	this.imarkerId = this.interactiveMarkerManager.updater.iMarkerNodes.find(msg.name); 

	// then convery the message to interactive marker manager    
	this.interactiveMarkerManager.updater.receiveInteractiveMarkerMessage(msg);
    }
});