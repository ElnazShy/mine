dojo.provide("museum.PoseSequenceEntry");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.TooltipDialog");

dojo.require("museum.Utils");
dojo.require("museum.common.RobotPose");


/**
 * The museum.RobotPose class represents a single robot pose entry in the robot pose list.
 * It maintains the following internal information:
 *  - joint states to represent pose
 *  - duration of pose
 * And it visually displays:
 *  - an image of the pose
 *  - Buttons to modify the pose
 */
dojo.declare("museum.PoseSequenceEntry", [dijit._Widget, dijit._Templated], {
	
	// Optional
	width: 200,
	height: 200,
	imgPreview: null,
	korgState: null, // If the korg state is specified, a robot pose will be extracted from it
	pose: null,
	number: 0,
	
	// Internal variables
	templateString: dojo.cache("museum", "templates/PoseSequenceEntry.html"),
	
	postCreate: function() {		
		dojo.addClass(this.domNode, "pose-sequence-entry");
		if (this.imgPreview) {
			this.setImage(this.imgPreview);
		}
		
		if (this.korgState) {
			this.pose = museum.common.RobotPose.fromKorg(this.korgState);
		} else {
			this.pose = new museum.common.RobotPose();
		}
		this.setPose(this.pose);
    this.setRemoveButton();
		
		this.setPoseNumber(this.number);

		dojo.connect(this.domNode,"onmouseenter",this,"onmouseenter");
		dojo.connect(this.domNode,"onmouseleave",this,"onmouseleave");
		dojo.connect(this.domNode,"onmousedown",this,"onmousedown");
		dojo.connect(this.domNode,"onmouseup",this,"onmouseup");

	},
	
	// Do some nice image scaling so that the image preview looks half decent :)
	setImage: function(dataURI) {
		// Create an image object from the provided data
		var img = document.createElement('img');
		img.src = dataURI;
		
		// The image doesn't load immediately and we have to continue processing in a callback
		img.onload = dojo.hitch(this, function() {
			// Figure out the scale factor for each dimension
			var xFactor = this.width / img.width;
			var yFactor = this.height / img.height;
			
			// To preserve aspect ratio, pick the smaller factor
			var factor = Math.min(xFactor, yFactor);
			
			// Figure out the offset into the canvas we have to paste the image
			var x = ((this.width / factor - img.width) / 2);
			var y = ((this.height / factor - img.height) / 2);
			
			// Create a canvas with the same aspect ratio as the preview image.
			// Copy the image onto it.  Make sure the canvas is scaled correctly
			var srcCanvas = document.createElement("canvas");
			srcCanvas.width = this.width / factor;
			srcCanvas.height = this.height / factor;
			srcCanvas.getContext("2d").drawImage(img, x, y);
			
			// Now create a new canvas onto which we place the resized image
			var destCanvas = document.createElement('canvas');
			destCanvas.width = this.width;
			destCanvas.height = this.height;
			
			// Draw the image, scaled, onto the new canvas
			destCanvas.getContext("2d").drawImage(
					srcCanvas, 0, 0, srcCanvas.width, srcCanvas.height, 
					0, 0, this.width, this.height);
			
			// Now that the image has been scaled, set the actual display image to this scaled image
			this.image.src = destCanvas.toDataURL();
		});
	},
	
	setPose: function(pose) {
		this.poseDetailsAttach.innerHTML = "";
		this.poseDetailsAttach.appendChild(pose.toDomNode());
	},

	setPoseNumber: function(number) {
		this.poseNumberAttach.innerHTML = "";
		this.poseNumberAttach.appendChild(document.createTextNode(number))
	},

  setRemoveButton : function() { 
  },

	onmouseenter : function(event) {
//		dojo.style(this.domNode,"background-color","#CFFFFF");
	
	},

	onmouseleave : function(event) {
//		dojo.style(this.domNode,"background-color","#CFEFFF");
	},

	onmousedown : function(event) {
//		dojo.style(this.domNode,"background-color","#FFFFFF");
	},

	onmouseup : function(event) {
//		dojo.style(this.domNode,"background-color","#CFEFFF");
	},


});
