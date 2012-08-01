dojo.provide("museum.PoseTabWrapper");

dojo.require("museum.PoseSequence");

dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");

dojo.require("dijit._Widget");

dojo.declare("museum.PoseTabWrapper", [dijit._Widget,dijit.layout.TabContainer], {

  postCreate : function() {
		dojo.addClass(this.domNode, "pose-sequence");

    this.ps = new museum.PoseSequence({title:"V"});
		dojo.style(this.ps.domNode,"height","100%");
		dojo.style(this.ps.domNode,"width","90%");
   
    this.addChild(this.ps);
    this.startup();
  },

	setHeight: function(height) {
		console.log("Setting posesquence widget height to ", height);
		dojo.style(this.domNode, "height", height+"px");
	}

});
