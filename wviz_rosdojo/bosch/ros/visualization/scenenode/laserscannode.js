/**
 * @class LaseScanNode
 * @brief Class that keeps laser scan visualization properties. 
 * @details An instance of this class keeps necessary values to visualize a laser scanner in wviz.
 */
ros.visualization.LaserScanNode = ros.visualization.SceneNode.extend({

    /**
     * Constructor.
     * @param vm visualization manager. An instance of the class defined in rosjs_visualization/js/visualization/visualizationmanager.js.
     * @param args An array of arguments to pass in the constructor. args[0]: current_frame (e.g. /odom_combined or /base_link). args[1]: topic that publishes a message of type sensor_msgs/LaserScan.
     */
    init: function(vm,args) 
    {
	if(args.length == 2){
	    this.current_frame = args[0];
	    this.topic = args[1];
	}
	else{
	    
	    this.current_frame = "/odom_combined";
	    this.topic = "";
	}

	this._super(vm);      
	this.redraw=0;

	this.model = new ros.visualization.LaserScanModel(vm.gl, vm.shader_manager,vm.scene_viewer,vm.node);

	this.model.node.subscribe(this.topic, function(msg){ this.updateFromMessage(msg)});
	this.frame_id = this.current_frame;
	this.oldTopic = "";
	this.msgType = "sensor_msgs/LaserScan";
	// Which attributes of this widget should be accessible from PropertiesWidget?
	this.keys={"frame_id":this.frame_id, "topic":this.topic};
	this.name="";
    },
    /**
     * Unsubsribe from the old topic and subsribe to a new topic.
     * @param newTopic the new topic to which we would like to subscribe.
     */
    changeTopic: function(newTopic){
    	var that = this;
    	that.model.node.unsubscribe(that.topic);
    	that.model.node.subscribe(newTopic,function(msg){ that.updateFromMessage(msg)});
	that.oldTopic = that.topic;
	that.topic = newTopic;
    },
    /**
     * Unsubscribe from 'topic'
     */
    unsub: function(){
	var that = this;
	that.model.node.unsubscribe(that.topic);
    },
    /**
     * Gets the message in, manipulates or extracts information from it, then passes it back to interactive marker manager's updater object.
     * @param msg a ROS message of type visualization_msgs/InteractiveMarker
     */
    updateFromMessage: function(msg) 
    {
	this.setFrame(msg.header.frame_id);
	// You can do something with the message here
	// Then pass it to model's callback method
	this.model.updateFromMessage(msg);
    },
});