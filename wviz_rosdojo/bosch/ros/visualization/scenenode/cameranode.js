/**
 * @class CameraNode
 * @brief Creates a Camera Node that works with a Camera Widget.
 * @details This node is here for compatibility with the visualization control panel. To see Camera Widget refer to rosjs_remotelabwidgets/js/visualization_widgets/CameraWidget.js}
 */
ros.visualization.CameraNode = ros.visualization.SceneNode.extend({

    /** 
     * Constructor. Sets the default values for the intended camera feed.
     * @param vm visualization manager. An instance of the class defined in rosjs_visualization/js/visualization/visualizationmanager.js.
     * @param args arguments for future use
     */
    init: function(vm,args){
	this.redraw=0;
	this.oldTopic = '';
	this.host = '';
	this.topic = '';
	this.image_width = 320;
	this.image_height = 240;
	this.quality = 30;
	this.invert = false;
	// Which attributes of this widget should be accessible from PropertiesWidget?
	this.keys={"host":this.host,"topic":this.topic,"image_width":this.image_width,"image_height":this.image_height,"quality":this.quality,"invert":this.invert};
	this.name='';
	this.widgetType = "CameraWidget";
	this.hasWidget = true;
	this.widget = {};
	this.msgType = "sensor_msgs/Image";
    },
    /**
     * This method is here for compatibility with other scene nodes. It does not actually change the topic. Currently camera feeds are provided by mjpeg_server as a stream or snapshot, not as a message.
     * @param newTopic new topic that we want this scene node to listen to
     */
    changeTopic: function(newTopic){
	this.oldTopic = this.topic;
	this.topic = newTopic;
    },
    /**
     * If a camera feed property changes, this method is called by the visualization_control_panel. This method updates CameraWidget's variables and triggers onUpdate() method to reflect the changes.
     */
    changeUri: function(){
	// This node does not really subscribe to a topic (yet)
	// We keep the function name the same for compability and to prevent confusion
	
	this.widget.host = this.host;
	this.widget.topic = this.topic;
	this.widget.image_width = this.image_width;
  	this.widget.image_height = this.image_height; 
	this.widget.width = this.image_width + 100;
	this.widget.height = this.image_height + 100;
	this.widget.invert = this.invert;
	this.widget.quality = this.quality;
	
	// The following call will update the 
	this.widget.onUpdate();
    },
    /**
     * This method is here for compatibility. This scene node does not subscribe to a topic.
     */
    unsub: function(){
	// This node does not really unsubscribe from topics (see changeTopic)
    },
    /**
     * This method is here for compatibility. This scene node does not have a callback.
     *
     */
    updateFromMessage: function(){
    },
});