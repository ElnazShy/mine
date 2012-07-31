/**
 * @class PointCloud2Node
 * @brief Class that helps point clouds (PCL2).
 * @details An object of this class keeps necessary variables to visualize a point cloud of type sensor_msgs/PointCloud2. It is suggested for instances of this class that they subscribe to a point cloud published by the pcl_filter package (pcl_filter package reduces the amount of points in the cloud so that data transmission and visualization takes less time).
 *
 */
ros.visualization.PointCloud2Node = ros.visualization.SceneNode.extend({
    /**
     * Constructor.
     * @param vm visualization manager. An instance of the class defined in rosjs_visualization/js/visualization/visualizationmanager.js.
     * @param args An array of arguments. Currently only 2 arguments are used: args[0]: current_frame (e.g. /base_link); args[1]: a topic that publishes ROS messages of type sensor_msgs/PointCloud2
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

	this.model = new ros.visualization.PointCloud2Model(vm.gl, vm.shader_manager,vm.scene_viewer,vm.node);

	this.model.node.subscribe(this.topic, function(msg){ this.updateFromMessage(msg)});
	this.frame_id = this.current_frame;
	this.oldTopic = "";
	this.msgType = "sensor_msgs/PointCloud2";
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
     * Gets the message in, manipulates or extracts information from it.
     * Here we set the frame of the pcl2node to the frame_id we receive from the publisher, and then we call the update function of the model.
     * @param msg a ROS message of type sensor_msgs/PointCloud2
     */
    updateFromMessage: function(msg) 
    {
	this.setFrame(msg.header.frame_id);
	this.model.updateFromMessage(msg);
    },
});