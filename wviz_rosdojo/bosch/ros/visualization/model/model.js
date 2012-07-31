/*********************************************************************
 *
 * Software License Agreement (BSD License)
 *
 *  Copyright (c) 2010, Robert Bosch LLC.
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
 * @class Model
 * @brief Base class for 2D/3D models that will be rendered by WebGL.
 * @details Models extending this class are arrow, box, collada, sphere, pointcloud etc. They are rendered by WebGL and shown in the scene.
 */
ros.visualization.Model = Class.extend({
    /**
     * Constructor.
     * Initializes model attributes with their defaut values.
     * @param gl handle to a graphics library.
     * @param shader_manager handle to a shader manager to render objects and shades.
     */
    init: function(gl, shader_manager) 
    {
	this.gl = gl;
	this.shader_manager = shader_manager;
	this.color = [1.0,1.0,1.0];

	this.bounding_box = null;
	this.light = true;
	this.wireframe = false;
	this.primitives = "triangles";
	this.vertices = [];
	this.indices = [];
	this.name = "Model"
	this.highlightPass = 1;
	this.alphaValue = 1;

	this.parent = null;
    },
    /**
     * Sets the color of the model.
     * @param color an array of three elements (of values between 0.0-1.0) that defines the color of this model.
     */
    setColor: function (color)
    {
	this.color = color;
    },
    /**
     * To be documented...
     */
    setHighlightPass: function(pass)
    {
	this.highlightPass = pass;
    },
    /**
     * Sets the alpha of the model.
     * @param alpha a float between 0.0 and 1.0; where 0.0 makes the object invisible and 1.0 makes it opaque.
     */
    setAlpha : function(alpha)
    {
	this.alphaValue = alpha;
    },
    /**
     * To be documented...
     */
    fitBoxToPositionArray: function(positions)
    {
	var num_positions = positions.length / 3;
	var n = 0;
	
	if(num_positions<1) 
	    return null;
	
	minExtent = [0, 0, 0];
	maxExtent = [0, 0, 0];
	
	for (var index = 0; index < 3; ++index) {
	    maxExtent[index] = minExtent[index] = positions[n++];
	}
	for (var i = 1; i < num_positions; i++) {
	    for (var index = 0; index < 3; ++index) {
		minExtent[index] = Math.min(minExtent[index], positions[n]*1.1);
		maxExtent[index] = Math.max(maxExtent[index], positions[n]*1.1);
		n++;
	    }
	}
	return new ros.visualization.BoundingBox(minExtent,maxExtent,this.gl, this.shader_manager);
    },
    /**
     * 
     */
    updateBoundingBox: function(arg)
    {
	if (arg instanceof Array || arg instanceof Float32Array) {
	    this.bounding_box = this.fitBoxToPositionArray(arg);
	}
	else if (arg instanceof SglBox3) {
	    this.bounding_box = new ros.visualization.BoundingBox(arg.min, arg.max, this.gl, this.shader_manager);
	}
	else {
	    ros_error("couldn't update bounding box: unknown data input");
	}
    },
    /**
     * Enables / disables the light for this model.
     * @param enabled a boolean variable that defines the availability of light.
     */
    enableLight: function (enabled)
    {
	this.light = enabled;
    },
    /**
     * "In both 2D and 3D when you draw an object, you actually compose it with several smaller shapes called primitives. Primitives are one- or two-dimensinal entities or surfaces such as points, lines, and triangles that are assembled in 3D space to create 3D objects." (OpenGL SuperBible, 5th edition, page 27 Ch.1 - The Vertex).
     * @param pritimitives a string that defines the type of primitives for this model.
     *
     */
    setPrimitives: function (primitives)
    {
	this.primitives = primitives;
    },
    /**
     * Enables / disables the model.
     * @param enabled a boolean variable that defines the availability of model.
     */
    setEnable: function (enabled)
    {
	this.enabled = enabled;
    },
    /**
     * Checks if a ray intersects with another ray or a mesh. Returns the intersection result (true, or false) along with other intersection properties such as coordinates.
     *  @returns {!ros.visualization.RayIntersectionInfo} result that keeps intersection properties if there is one.
     */
    intersectRay: function(start, end)
    {
	if(this.prog == this.shader_manager.shaderPrograms[this.shader_manager.ShaderTypes.POINT_CLOUD])
	    return this.intersectRayPoints(start,end,this.vertices);
	else
	    return this.intersectRayOneMesh(start,end,this.vertices,this.indices);
    },
    /**
     * Checks if two rays intersect (for defined vertices between a start and an end point).Two rays are considered to be intersecting if defined verticies are closer than 0.04 to each other.
     * @param start the point where we start looking for an intersection.
     * @param end the point where we stop looking for an intersection.
     * @param verticies XYZ coordinates for which we look for an intersection.
     * @returns {!ros.visualization.RayIntersectionInfo} result result that keeps intersection properties if there is one.
     */
    intersectRayPoints : function(start, end, verticies)
    {
	var result = new ros.visualization.RayIntersectionInfo();
	result.valid = true;
	result.intersected = false;

	// the direction of the vector of the ray.   
	var dx = end[0] - start[0];
	var dy = end[1] - start[1];
	var dz = end[2] - start[2];

	var denom = dx * dx + dy * dy + dz * dz;
	denom = Math.sqrt(denom);

	for(var i =0; i < verticies.length; i+=3)
	{
	    var x = verticies[i]; 
	    var y = verticies[i+1]; 
	    var z = verticies[i+2]; 
	    
	    var x1 = new ros.math.Vector3(x - start[0],y - start[1], z - start[2]); 
	    var x2 = new ros.math.Vector3(x - end[0], y - end[1], z - end[2]);

	    var x3 = x1.crossProduct(x2);
	    var nom = x3.length();

	    var dist = nom / denom;
            
	    if(dist < 0.04) {
		result.intersected = true;
		result.distance = x1.length();
		result.position[0] = x;
		result.position[1] = y;
		result.position[2] = z;
	    }

	}

	return result;

    },
    /**
     * Checks if a ray and a mesh intersect (for defined vertices and indices, between a start and an end point).
     * @param start the point where we start looking for an intersection.
     * @param end the point where we stop looking for an intersection.
     * @param verticies XYZ coordinates for which we look for an intersection.
     * @param indexInfo indices from which we will read the number of triangles (primitives) and vertices' indices of the mesh.
     * @returns {!ros.visualization.RayIntersectionInfo} result result that keeps intersection properties if there is one.
     */
    intersectRayOneMesh: function(start, end,vertexInfo,indexInfo) {

	var result = new ros.visualization.RayIntersectionInfo();
	result.valid = true;
	result.intersected = false;
	
	var numIndices = indexInfo.length;
	var numTriangles = numIndices / 3;

	// the direction of the vector of the ray.
	var x = end[0] - start[0];
	var y = end[1] - start[1];
	var z = end[2] - start[2];

	// find two vectors orthogonal to direction for use in quickly eliminating
	// triangles which can't possibly intersect the ray.
	var direction = [x,y,z];

	// Pick a vector orthogonal to direction called u.
	var ux = -y;
	var uy = x;
	var uz = 0;
	if(x * x + y * y < z * z) {
	    ux = -z;
	    uy = 0;
	    uz = x;
	}

	// Cross product directino and u get a third orthogonal vector v.
	var vx = y * uz - z * uy;
	var vy = z * ux - x * uz;
	var vz = x * uy - y * ux;

	var udotstart = ux * start[0] + uy * start[1] + uz * start[2];
	var vdotstart = vx * start[0] + vy * start[1] + vz * start[2];

	// As we search for an intersectin point, we keep track of how far out
	// from the start the point with this variable;
	var min_distance = 0;

	for (var i = 0; i < numTriangles; i++) {
	    // extract three vertices index for triangle
	    var indices = [indexInfo[i*3], indexInfo[i*3+1],indexInfo[ i*3+2]];
	    
	    
	    // Check if the current triangle is too far to one side of the ray
	    // to intersect at all.(This is what the orthogonal vectors are for)
	    var u_sides = [false, false, false];
	    var v_sides = [false, false, false];
	    for(var j = 0; j < 3; j++) {
		var t = 3 * indices[j];
		var r = vertexInfo.slice(t,t+3);
		u_sides[j] = ux * r[0] + uy * r[1] + uz * r[2] - udotstart > 0;
		v_sides[j] = vx * r[0] + vy * r[1] + vz * r[2] - vdotstart > 0;
	    }

	    // All vertices of the triangle are on the same side of the start point,
	    // the ray cannot intersect, so we move on.
	    if(((u_sides[0] == u_sides[1]) && (u_sides[0] == u_sides[2])) ||
               ((v_sides[0] == v_sides[1]) && (v_sides[0] == v_sides[2]))) {
		continue;
	    }

	    var t1,t2,t3;
	    t1 = 3 * indices[0];
	    var m00 = vertexInfo[t1]   - start[0];
	    var m01 = vertexInfo[t1+1] - start[1];
	    var m02 = vertexInfo[t1+2] - start[2];
	    t2 = 3 * indices[1];
	    var m10 = vertexInfo[t2]   - start[0];
	    var m11 = vertexInfo[t2+1] - start[1];
	    var m12 = vertexInfo[t2+2] - start[2];
	    t3 = 3 * indices[2];
	    var m20 = vertexInfo[t3]   - start[0];
	    var m21 = vertexInfo[t3+1] - start[1];
	    var m22 = vertexInfo[t3+2] - start[2];

	    var t00 = m11 * m22 - m12 * m21;
	    var t10 = m01 * m22 - m02 * m21;
	    var t20 = m01 * m12 - m02 * m11;

	    // compute the determinant of the matrix.
	    var d = m00 * t00 - m10 * t10 + m20 * t20;


	    // to see if it is culled
	    //      if(d > 0)
	    //        continue;

	    // Transform the direction vector by the inverse of that matrix
	    // If the end point is in the first octant, it's a hit.
	    var v0 = (t00 * x - 
		      (m10 * m22 -m12 * m20) * y +
		      (m10 * m21 -m11 * m20) * z) / d;
	    var v1 = (-t10 * x +
		      (m00 * m22 - m02 * m20) * y -
		      (m00 * m21 - m01 * m20) * z) / d;
	    var v2 = (t20 * x - 
		      (m00 * m12 - m02 * m10) * y +
		      (m00 * m11 - m01 * m10) * z) / d;

	    if (v0 >= 0 && v1 >= 0 && v2 >= 0 && (v0 + v1 + v2 > 0)) {
		// rescale by the one-norm to find the intersection of the transformed.
		// ray with the unit triangle
		var one_norm = v0 + v1 + v2;
		v0 /= one_norm;
		v1 /= one_norm;
		v2 /= one_norm;

		// Multiply m to get back to the original triangle
		var px = m00 * v0 + m10 * v1 + m20 * v2;
		var py = m01 * v0 + m11 * v1 + m21 * v2;
		var pz = m02 * v0 + m12 * v1 + m22 * v2;

		// compute the distance (actually distance squared) from the start point
		// to the intersection.
		var distance = px * px + py * py + pz * pz;

		if(!result.intersected || distance < min_distance) {
		    min_distance = distance;
		    result.position[0] = px + start[0];
		    result.position[1] = py + start[1];
		    result.position[2] = pz + start[2];
		    result.distance = min_distance;
		}
		result.intersected = true;
	    } 
	}

	return result;
    },    
});

ros.include('visualization/model/boxmodel');
ros.include('visualization/model/boundingboxmodel');
ros.include('visualization/model/spheremodel');
ros.include('visualization/model/arrowmodel');
ros.include('visualization/model/mapmodel');
ros.include('visualization/model/pointcloud2model');
ros.include('visualization/model/pointcloudmodel');
ros.include('visualization/model/gridmodel');
ros.include('visualization/model/colladamodel');
ros.include('visualization/model/linestripmodel');
ros.include('visualization/model/linelistmodel');
ros.include('visualization/model/trianglelistmodel');
ros.include('visualization/model/viewfacingtextmodel');
ros.include('visualization/model/cylindermodel');
ros.include('visualization/model/pointsmodel');
ros.include('visualization/model/laserscanmodel');
