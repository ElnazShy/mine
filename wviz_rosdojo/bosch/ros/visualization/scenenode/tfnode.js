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
 * @class TFNode
 * @brief Class that helps visualizing multiple coordinate frames (TFs).
 * @details An object of this class keeps necessary variables to visualize a coordinate frame tree (TF).
 */
ros.visualization.TFNode = ros.visualization.SceneNode.extend({
    /**
     * Constructor.
     * @param vm visualization manager. An instance of the class defined in rosjs_visualization/js/visualization/visualizationmanager.js.
     * @param tf tf served by ROS_MASTER.
     */
    init: function(vm, tf) 
    {
	this._super(vm);
	this.prog = this.vm.shader_manager.shaderPrograms[this.vm.shader_manager.ShaderTypes.FLAT];
	this.renderer = new SglMeshGLRenderer(this.prog);
	this.tf = tf;
	this.child = new ros.visualization.CoordinateFrameNode(vm);
	this.child.setScale([0.1,0.1,0.1]);
	this.keys = {"tf":this.tf};
	this.redraw = 0;
	this.name = "";
    },
    /**
     * Rotates and loads axes models (XYZ) then calls a callback function.
     * @param callback function to call back after loading all three axes.
     * @param scene_viewer currently not used.
     */
    load: function (callback, scene_viewer)
    {
	this.child.load();
	this.child.children[0].matrix = sglMulM4(this.child.children[0].matrix, sglRotationAngleAxisM4C(-Math.PI/2.0, 0, 1.0, 0));
	this.child.children[1].matrix = sglMulM4(this.child.children[1].matrix, sglRotationAngleAxisM4C(Math.PI/2.0, 1.0, 0, 0));
	this.child.children[2].matrix = sglMulM4(this.child.children[2].matrix, sglRotationAngleAxisM4C(Math.PI, 1.0, 0, 0));
	var async = (callback) ? (true) : (false);
	if(async) {
	    callback(this);
	}
    },
    /**
     * Draws all coordinate frames in a tf tree onto the scene, recursively.
     * @param gl handle to graphics library
     * @param xform
     * @param node root node of the tf tree that we want to draw
     * @param matrix an identity matrix
     */
    drawNodeRecursive: function (gl, xform, node, matrix)
    {
	xform.model.push();
	xform.model.multiply(matrix);
	// draw children
	for ( var c in node.children) {
	    this.drawNodeRecursive(gl, xform, node.children[c], node.transforms[c]);
	}
	//    xform.model.pop();
	//draw node
	//    xform.model.multiply(this.child.matrix);
	xform.model.scale(this.child.scale[0], this.child.scale[1], this.child.scale[2]);
	this.drawCoordinateFrame(gl, xform);
	xform.model.pop(); 
    },
    /**
     * Draws a coordinate frame (translated, rotated and scaled).
     * @param gl a handle to the graphics library
     * @param xform
     */
    drawCoordinateFrame : function(gl, xform)
    {
	var coord = this.child;

	for(var c in coord.children)
	{
	    var child = coord.children[c];
	    xform.model.push();
	    xform.model.multiply(child.matrix);
	    xform.model.scale(child.scale[0],child.scale[1], child.scale[2]);
	    child.draw(gl,xform);
	    xform.model.pop();
	}
    },
    /**
     * Gets the root of a tf tree and then calls necessary functions to draw all coordinate frames in a tf tree.
     * @param gl a handle to the graphics library
     * @param xform 
     */
    draw: function (gl, xform)
    {
	if(this.tf.tree) {
	    this.renderer.begin();
	    var rootNode = this.tf.tree.getRootNode();
	    if(rootNode) {
		this.drawNodeRecursive(gl, xform, rootNode, sglIdentityM4());
	    }
	    this.renderer.end();
	}
    },
    
});
