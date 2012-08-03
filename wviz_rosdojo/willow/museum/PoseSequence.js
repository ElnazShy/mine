dojo.provide("museum.PoseSequence");

dojo.require("dijit._Widget");
dojo.require("museum.PoseSequenceEntry");
dojo.require("dijit.layout.ContentPane");

dojo.declare("museum.PoseSequence", [dijit._Widget, dijit.layout.ContentPane], {
	
	// Internal variables
	poses: null,
	
	postCreate: function() {
//		dojo.addClass(this.domNode, "pose-sequence");
		this.domNode.innerHTML = "&nbsp;"; // kinda a hack...
		
		this.poses = [];
	},
	
	addPose: function(korgState, imgPreview) {
		var pose = new museum.PoseSequenceEntry({ 
			imgPreview: imgPreview, 
			korgState: korgState,
			number: this.poses.length+1
		});
		this.domNode.appendChild(pose.domNode);
		this.poses.push(pose);
		dojo.window.scrollIntoView(pose.domNode);
	},
	
	setHeight: function(height) {
		dojo.style(this.domNode,"height","90%");
		dojo.style(this.domNode,"width","90%");

	}
	
});
