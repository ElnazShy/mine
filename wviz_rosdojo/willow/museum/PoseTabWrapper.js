dojo.provide("museum.PoseTabWrapper");

dojo.require("museum.PoseSequence");

dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");

dojo.require("dijit._Widget");

dojo.declare("museum.PoseTabWrapper", [dijit._Widget,dijit.layout.TabContainer], {

  postCreate : function() {
		dojo.addClass(this.domNode, "pose-sequence");

    this.addChild(this.createPoseSequence("&#9679"));
    this.addChild(this.createPoseSequence("&#9632"));
    this.addChild(this.createPoseSequence("&times"));
    this.addChild(this.createPoseSequence("&#9650"));
    this.startup();
  },

  createPoseSequence : function(label) {
    var tab = new museum.PoseSequence({title:label});

		dojo.style(tab.domNode,"margin","5%");
		dojo.style(tab.domNode,"height","90%");
		dojo.style(tab.domNode,"width","80%");

    return tab;
  },

	setHeight: function(height) {
		console.log("Setting posesquence widget height to ", height);
		dojo.style(this.domNode, "height", height+"px");
		this.height = height;
	},

	addPose : function(korgState, imgPreview) {
		this.selectedChildWidget.addPose(korgState,imgPreview);
		dojo.style(this.domNode, "height", this.height+"px");
	},


});
