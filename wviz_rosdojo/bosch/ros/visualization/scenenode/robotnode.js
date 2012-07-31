/*********************************************************************
 *
 * Software License Agreement (BSD License)
 *
 *  Copyright (c) 2011, Robert Bosch LLC.
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above
 *     copyright notice, this list of conditions and the following
 *     disclaimer in the documentation and/or other materials provided
 *     with the distribution.
 *   * Neither the name of the Robert Bosch nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 *  FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 *  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 *  CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 *  LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 *
 *********************************************************************/
/**
 * @class RobotNode
 * @brief Class that helps visualizing robot models.
 * @details An object of this class keeps necessary variables to visualize a robot model from a urdf.xml file. File could be served (on a web server) or could be defined as a ROS parameter, such as robot_description.
 */
ros.visualization.RobotNode = ros.visualization.SceneNode.extend({
    /**
     * Constructor.
     * @param vm visualization manager. An instance of the class defined in rosjs_visualization/js/visualization/visualizationmanager.js.
     * @param args An array of arguments. Currently 4 arguments are in use: args[0]: urdf_xml; args[1]: alpha; args[2]: scaleFactor; args[3]: name;
     */
    init: function(vm,args)
    {
	this._super(vm);
	this.prog = vm.shader_manager.shaderPrograms[vm.shader_manager.ShaderTypes.PHONG];
	this.renderer = new SglMeshGLRenderer(this.prog);

	this.light = false;
	this.alpha = 1;
	this.scaleFactor = 1;
	this.oldScaleFactor = 1;
	this.name = "Robot";
	this.robotDescription = "robot_description"; // robot description parameter that we will get
	this.oldRobotDescription = "robot_description";
	this.redraw = 0;
	this.loadFromFile = true;
	this.xmlDoc = null;
	this.keys={"robotDescription":this.robotDescription,"scaleFactor":this.scaleFactor};
	
	
	
	if(args.length == 0){
	    // Either a wrong function call in the html, or,
	    // the user clicked on Add new Robot Model
	    // 
	    // Let's try to get the robot description parameter
	    var self = this;

	    this.vm.node.getParam("/"+this.robotDescription, function(xmlString){
		// If the xmlString is not empty
		if(xmlString == 0){
		    console.log("Could not get robot description");
		}
		else{
		    self.loadFromFile = false;
		    console.log("Robot description is:");
		    console.log(xmlString)
		    // We need to convert the stringXML into an XML document
		    var parser=new DOMParser();
		    var xmlDoc=parser.parseFromString(xmlString,'text/xml');
		    console.log("XML Document");
		    // setTimeout(function(){console.log(xmlDoc)},5000);
		    console.log(xmlDoc);
		    // setTimeout(function(){self.xmlDoc = xmlDoc},5000);;
		    self.xmlDoc = xmlDoc;
		    // setTimeout(function(){self.load()},5000);
		    self.load();
		}
	    });
	}
	
	if(args.length >= 1){
	    // urdf_xml is defined
	    console.log(this.urdf_xml);
	    this.urdf_xml = args[0];
	}

	if(args.length >= 2){
	    // alpha is defined
	    this.alpha = args[1];
	}

	// if(alpha == "undefined" || alpha == null)
	// 	this.alpha = 1;
	// else 
	//   this.alpha = alpha;

	
	if(args.length >=3 ){
	    //scaleFactor is defined
	    this.scaleFactor = args[2];
	}

	if(args.length == 4){
	    this.name = args[3];
	}
    },
    /**
     * Converts the pose to a translation/rotation matrix.
     * @param pose Euclidian XYZ and Quaternion XYZW pose of urdf
     * @returns translation rotation matrix calculated using the input argument
     */
    urdfPoseToMatrix: function (pose)
    {
	var matrix = sglIdentityM4();
	var translation = sglTranslationM4V([pose.position.x, pose.position.y, pose.position.z]);
	var rotation = sglGetQuatRotationM4([pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w]);
	matrix = sglMulM4(matrix,translation);
	matrix = sglMulM4(matrix,rotation);
	return matrix;
    },

    /**
     * Loads the robot model either from a urdf file or from a robot_description parameter served by ROS_MASTER.
     * @param callback the function which we will call after loading the robot model.
     * @param scene_viewer an instance of the SceneViewer class defined in rosjs_visualization/js/visualization/sceneviewer.js.
     */
    load: function (callback, scene_viewer)
    {
	var that = this;
	var urdf_model = new ros.urdf.Model();
	var sf = this.scaleFactor;
	console.log("RobotNode.load - My scaleFactor is: "+sf);
	function onLoadUrdfModel() {
	    // load all models
	    var links = urdf_model.getLinks().valSet();
	    for( var l in links) {
		var link = links[l];
		if(!link.visual) continue; 
		if(!link.visual.geometry) continue;
		if(link.visual.geometry.type == link.visual.geometry.GeometryTypes.MESH) {
		    var frameId = new String("/"+link.name);
		    var uri = link.visual.geometry.filename.replace("package://",dojo.moduleUrl("bosch","resources/"));
		    
		    // ignore mesh files which are not in collada format
		    if (uri.substr(-4).toLowerCase() != ".dae") {
			ros_error(uri + " is not a valid collada file!");
			continue;
		    }

		    // create a collada model
		    var scene = { frame:frameId, url:uri, specular:[0.0, 0.0, 0.0, 0.0], eye:[0.0,0.0,4.0], alpha: that.alpha};
		    var scene_node = new ros.visualization.SceneNode(this.vm);
		    var collada_model = new ros.visualization.ColladaModel(that.vm.gl, that.vm.shader_manager, scene, sf); // sf: scaleFactor

		    scene_node.matrix = that.matrix;
		    scene_node.matrix = sglMulM4(that.urdfPoseToMatrix(link.visual.origin),scene_node.matrix); 
		    scene_node.setFrame(frameId);
		    scene_node.scale = that.scale;
		    scene_node.pickable = that.pickable;

		    collada_model.light = this.light;

		    // load collada file
		    collada_model.load(this);

		    if(that.light) {  
			collada_model.shader = that.vm.shader_manager.ShaderTypes.PHONG;
		    }
		    else {
			collada_model.shader = that.vm.shader_manager.ShaderTypes.TEXTURE;
		    }

		    collada_model.prog = that.vm.shader_manager.shaderPrograms[collada_model.shader];
		    collada_model.renderer = new SglMeshGLRenderer(collada_model.prog);
		    scene_node.setModel(collada_model);

		    that.children.push(scene_node);
		}
	    }
	}
	
	if((this.urdf_xml != null || this.urdf_xml != undefined) && this.loadFromFile){
	    console.log("Loading from file");
	    urdf_model.initFile(this.urdf_xml, onLoadUrdfModel);
	}
	else{
	    console.log("Loading from a parameter");
	    console.log(this);
	    setTimeout(function(){urdf_model.initXml(that.xmlDoc)},4000);
	    setTimeout(onLoadUrdfModel,4000);
	    console.log("This is my robot node instance");
	    console.log(this);
	}
	
	var async = (callback) ? (true) : (false);
	if(async) {
	    callback(this);
	}
    },
    /** 
     * Sets a shader for the robot model depending on the input.
     * @param enable True or false. Switch between the shader that uses light versus uses a texture.
     */
    setLight : function(enable)
    {
	this.light = enable;

	if(this.light) {  
	    collada_model.shader = that.vm.shader_manager.ShaderTypes.PHONG;
	}
	else {
	    collada_model.shader = that.vm.shader_manager.ShaderTypes.TEXTURE;  
	}
    },
    /**
     * When the user changes robot decription parameter for this given instance of robot model, this method is called from Visualization Control Panel. This method retrieves a robot description parameter from ROS_MASTER (as a String), then parses the description as an XML document, and then loads the model.
     * @param newDecription ROS parameter that serves the robot description.
     */
    changeDescription: function(newDescription){
	// newDescription is the parameter we have to get from the ros parameter server
	console.log("Change Description");
	//console.log(this);
	// Here we want to get the robot description as 
	var self = this;
	this.vm.node.getParam("/"+this.robotDescription, function(xmlString){
	    // If the xmlString is not empty
	    if(xmlString == 0){
		console.log("Could not get robot description");
	    }
	    else{
		self.loadFromFile = false;
		console.log("Robot description is:");
		console.log(xmlString)
		// We need to convert the stringXML into an XML document
		var parser=new DOMParser();
		var xmlDoc=parser.parseFromString(xmlString,'text/xml');
		console.log("XML Document");
		console.log(xmlDoc);
	    }
	});
	this.oldRobotDescription = this.robotDescription;
	this.robotDescription = newDescription;
    },
    /**
     * Similar to changeDescription method, except this method gets called by Visualization Control Panel when the user changes robot scale factor.
     * 
     */
    changeScale: function(newScale){
	
	this.scaleFactor = newScale;
	this.oldScaleFactor = this.scaleFactor;
	var self = this;
	

	this.vm.node.getParam("/"+this.robotDescription, function(xmlString){
	    // If the xmlString is not empty
	    if(xmlString == 0){
		console.log("Could not get robot description");
	    }
	    else{
		self.loadFromFile = false;
		console.log("Robot description is:");
		console.log(xmlString)
		// We need to convert the stringXML into an XML document
		var parser=new DOMParser();
		var xmlDoc=parser.parseFromString(xmlString,'text/xml');
		console.log("XML Document");
		console.log(xmlDoc);
		self.xmlDoc = xmlDoc;
		self.load();
	    }
	});
    },

});
