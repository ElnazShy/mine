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
 * @class SceneNode
 * @brief Class that helps visualizing all objects in the scene (canvas).
 * @details Currently wviz renders the scene using WebGL (SpiderGL to be more specific). Every model and object in the scene thus is at least one single node. Every node has its own properties such as scale, position, oritentation etc. and they are kept as attributes of the instance of this class. SceneNode is actually a base class and all other nodes extend it (e.g. TFNode, PointCloud2Node etc.).
 */
ros.visualization.SceneNode = Class.extend({
    /**
     * Constructor.
     * Initializes default values for scene node attributes.
     * @param vm visualization manager. An instance of the class defined in rosjs_visualization/js/visualization/visualizationmanager.js.
     */
    init: function(vm)
    {
	this.vm = vm;
	this.frame_id = "";
	this.position = new ros.math.Vector3();
	this.orientation = new ros.math.Quaternion();
	this.matrix = sglIdentityM4();
	this.scale = [1.0,1.0,1.0];

	// Scene node can have either children or model
	// only leaf node is supposed to have model
	this.children = [];
	this.model = null;

	this.enabled = true;
	this.pickable = false;
	this.bounding_box = null;
	this.bounding_box_enable = false;

	this.parent = null;

	this.lastRotate = new ros.math.Quaternion(1,0,0,0);
	this.lastTranslate = new ros.math.Vector3(0,0,0);
	
	this.nodeId = null;
	
    },
    /**
     * Calculates a tranformation matrix based on previously set values of position (XYZ) and orientation (Quaternion) arrays.
     *
     */
    calculateMatrixFromPose: function()
    {
	var matrix = sglIdentityM4();
	var translation = sglTranslationM4V([this.position.x, this.position.y, this.position.z]);
	var rotation = sglGetQuatRotationM4([this.orientation.x, this.orientation.y, this.orientation.z, this.orientation.w]);
	var scale  = sglScalingM4V(this.scale);
	//console.log("CALCULATE MATRIX FROM POSE");
	matrix = sglMulM4(matrix, translation);
	matrix = sglMulM4(matrix, rotation);
	matrix = sglMulM4(matrix, scale); 

	this.matrix = matrix;
    },
    /**
     * Sets the visualization manager for this scene node and its children.
     * @param vm visualization manager. An instance of the class defined in rosjs_visualization/js/visualization/visualizationmanager.js.
     */
    setVM : function(vm)
    {
	this.vm = vm;

	for(var i in this.children)
	{
	    this.children[i].setVM(vm);
	}
    },
    /**
     * Calculates a transformation matrix for the node based on a ROS geometry_msgs/Pose message.
     * @param pose a ROS geometry_msgs/Pose
     */
    setPose: function(pose)
    {
	var position = pose.position;
	var orientation = pose.orientation;
	if(orientation.x == 0 && orientation.y ==0 && orientation.z == 0  && orientation.w ==0)
	    orientation.w = 1;

	this.position = new ros.math.Vector3(position.x, position.y, position.z);
	this.orientation = new ros.math.Quaternion(orientation.w, orientation.x, orientation.y, orientation.z);
	this.orientation.normalise();
	this.setCumMatrix();
    },
    /**
     * Calculates a transformation matrix for the node based on a XYZ position vector.
     * @param position Position of the object/model (node) in the scene in XYZ. A ROS geometry_msgs/Position message.
     */
    setPosition: function(position)
    {
	this.position = new ros.math.Vector3(position.x, position.y, position.z);
	this.setCumMatrix();
    },
    /**
     * Returns the current position of the model (node) in the scene.
     * @returns {!ros.math.Vector3} XYZ position of the node.
     */
    getPosition : function()
    {
	return new ros.math.Vector3(this.position.x,this.position.y,this.position.z);
    },
    /**
     * Calculates a transformation matrix for the node based on a Quaternion orientation vector.
     * @param orientation Orientation of the object/model (node) in the scene. A ROS geometry_msgs/Quaternion message.
     */
    setOrientation: function(orientation)
    {
	if(orientation.x == 0 && orientation.y ==0 && orientation.z == 0  && orientation.w ==0)
	    orientation.w = 1;
	this.orientation = new ros.math.Quaternion(orientation.w, orientation.x, orientation.y, orientation.z);
	
	this.setCumMatrix();
    },
    /**
     * Returns the current orientation of the model (node) in the scene.
     * @returns {!ros.math.Quaternion} orientation of the node in Quaternion.
     */
    getOrientation: function()
    {
	var q = new ros.math.Quaternion(this.orientation.w, this.orientation.x, this.orientation.y, this.orientation.z);
	return q;
    },
    /**
     * Sets the coordinate frame for the node.
     * @param frame_id a ROS frame published in TF tree.
     */
    setFrame: function(frame_id)
    { 
	ros_debug("SceneNode says: frame_id is "+frame_id);	
	this.frame_id = ros.tf.formatFrameID(frame_id);
    },
    /**
     * Sets the scale of the node.
     * @param scale a vector of three elements, defining the scale in XYZ dimensions.
     */
    setScale: function(scale)
    {
	this.scale = scale;
    },
    /** 
     * Calculates a transformation matrix based on the position and the orientation attributes of the node. It then sets position/orientation for all children of this node (if any).
     *
     */
    setCumMatrix : function()
    {
	if(this.parent)
	{
	    var matrix = sglIdentityM4();
	    var translation = sglTranslationM4V([this.position.x, this.position.y, this.position.z]);
	    var rotation = sglGetQuatRotationM4([this.orientation.x, this.orientation.y, this.orientation.z, this.orientation.w]);
	    var scale  = sglScalingM4V(this.scale);
	    matrix = sglMulM4(matrix, translation);
	    matrix = sglMulM4(matrix, rotation);
	    matrix = sglMulM4(matrix, scale);

	    var pmatrix = sglIdentityM4();
	    var pscale  = sglScalingM4V(this.parent.scale);
	    pmatrix = sglMulM4(pmatrix, this.parent.matrix);
	    pmatrix = sglMulM4(pmatrix, pscale);

	    this.matrix = sglMulM4(pmatrix, matrix);
	}
	else {
	    this.calculateMatrixFromPose();
	}

	for(var c in this.children)
	{
	    this.children[c].setCumMatrix();
	}
    },
    /**
     * Returns true if the object/model that his node represents is pickable in the scene, false otherwise.
     * @returns pickable a boolean variable that sets the pickability of the model in the scene.
     */
    isPickable: function()
    {
	return this.pickable;
    },
    /**
     * Sets the pickability of the object/model in the scene. It also propagates to this node's children.
     * @param pickable a boolean that sets the pickability to true or false.
     */
    setPickable: function(pickable)
    {
	this.pickable = pickable;

	for(var i in this.children)
	{
	    this.children[i].setPickable(pickable);
	}
    },
    /**
     * Sets the 3D model (e.g. mesh) for the object that this scene node represents.
     * @param {!ros.visualization.Model} a model that will be rendered by WebGL (e.g. point cloud, laser scan, grid etc.).
     */
    setModel: function(model)
    {
	this.model = model;
	this.model.parent = this;

    }, 
    /**
     * To be documented...
     */
    setHighlightPass: function(pass)
    {
	if(this.model)
	    this.model.setHighlightPass(pass)
	else 
	{
	    for(var c in this.children)
	    {
		this.children[c].setHighlightPass(pass);
	    }
	}
    },
    /**
     * Sets the alpha for this scene node's model.
     * @param alpha a float between 0.0 and 1.0; where 0.0 makes the object invisible and 1.0 makes it opaque.
     */
    setAlpha: function(alpha)
    {
	if(this.model)
	    this.model.setAlpha(alpha)
	else 
	{
	    for(var c in this.children)
	    {
		this.children[c].setAlpha(alpha);
	    }
	}
    },
    /**
     * Adds a child scene node to this scene node. 
     * @param child a scene node to be added under this one.
     */
    addChildNode: function(child)
    {
	child.parent = this;
	this.children.push(child);
    },
    /**
     * Not in use. But it is meant to remove a child from the array of children nodes.
     *
     */
    removeChildNode: function(child)
    {
	// maybe added later

    },
    /**
     * Enables / disables the node.
     * @param enabled a boolean variable that defines the availability of the scene node.
     */
    setEnable: function(enabled)
    {
	this.enabled = enabled;
    },
    /**
     * Enables / disables the bounding box for the scene node (and its children if any).
     * @param enabled a boolean variable that turns the bounding box on / off.
     */
    setBoundingBoxEnable: function(enabled)
    {
	this.bounding_box_enable = enabled;
	for(var c in this.children)
	{
	    this.children[c].setBoundingBoxEnable(enabled);
	}
    },
    /**
     * Tells this scene node who's its parent.
     * @param p another scene node.
     */
    setParent : function(p)
    {
	this.parent = p;
    },
    /**
     * Shifts the position of the model in the scene.
     * @param {!ros.math.Vector3} delta translation vector in XYZ.
     */
    translate : function(delta)
    {
	this.lastTranslate = delta;
	this.position.add(delta);
	this.setCumMatrix();
    },
    /**
     * Rotates the model in the scene
     * @param {!ros.math.Quaternion} delta_quat rotation vector in quaternion.
     */
    rotate : function(delta_quat)
    {
	this.lastRotate = delta_quat;
	this.orientation.multiplyQuat(delta_quat);
	
	this.setCumMatrix();
    },
    /**
     * To be documented...
     *
     */
    intersectRay: function(start, end)
    {
	var r;
	for(var c in this.children)
	{
	    r = this.children[c].intersectRay(start,end);      
	    if(r.intersected)
		return r;
	}

	if(this.model)
	{
	    r = this.model.intersectRay(start,end);

	    return r;
	}

	// if the node has neither model nor children, it has problem.
	return null;
    },
    /**
     * Loads the model for this scene node. It then calls the callback function passed-in.
     * @param callback a javascript function to be called after loading the object.
     */
    load: function(callback)
    {
	if(this.model) {
	    this.model.load();
	}
	else {
	    for(var c in this.children)
	    {
		this.children[c].load();
	    }
	}
	
	var async = (callback) ? (true) : (false);
	if (async) {
	    callback(this);
	}
    },
    /**
     * Draws the model of this node in the scene, if its bounding box is enabled.
     * @param gl graphics library
     * @param xform 
     */
    draw: function(gl, xform)
    {
	if(this.model)
	{
	    this.model.draw(gl,xform);

	    if(this.bounding_box_enable) {
		this.model.bounding_box.draw(gl,xform);
	    }
	}
    },

});
ros.include('visualization/scenenode/laserscannode');
ros.include('visualization/scenenode/gridnode');
ros.include('visualization/scenenode/pointcloud2node');
ros.include('visualization/scenenode/coordinateframenode');
ros.include('visualization/scenenode/tfnode');
ros.include('visualization/scenenode/robotnode');
ros.include('visualization/scenenode/mapnode');
ros.include('visualization/scenenode/cameranode');
ros.include('visualization/scenenode/markernode');
ros.include('visualization/scenenode/interactivemarkernode');

