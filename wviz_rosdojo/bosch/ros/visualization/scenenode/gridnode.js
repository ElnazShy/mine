/**
 * @class GridNode
 * @brief Class that creates a Grid in the scene.
 */
ros.visualization.GridNode = ros.visualization.SceneNode.extend({
    /**
     * Constructor. Sets default values for the Grid object.
     * @param vm visualization manager. An instance of the class defined in rosjs_visualization/js/visualization/visualizationmanager.js.
     * @param args array of arguments to pass in. current_frame, size, resolution, and color.
     */
    init: function(vm,args) 
    {

	if(args.length == 5){
	    this.current_frame = args[0];
	    this.size = args[1];
	    this.resolution = args[2];
	    this.color = args[3];
	}
	else{
	    
	    this.current_frame = "/odom_combined";
	    this.size = 10;
	    this.resolution = 0.1;
	    this.color = [Math.random(), Math.random(), Math.random()];
	}
	
	this._super(vm);      
	this.redraw=0;
	this.model = new ros.visualization.GridModel(vm.gl, vm.shader_manager, this.size, this.resolution, this.color);
	this.frame_id = this.current_frame;

	this.keys={"frame_id":this.frame_id, "size":this.size, "resolution":this.resolution,"color":this.color};
	this.name="";
    },
});
