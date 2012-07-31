dojo.provide("museum.PoseTabWrapper");

dojo.require("museum.PoseSequence");

dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");

dojo.require("dijit._Widget");

dojo.declare("museum.PoseTabWrapper", [dijit._Widget,dijit.layout.TabContainer], {

  postCreate : function() {
		dojo.addClass(this.domNode, "pose-sequence");

    var cp2 = new dijit.layout.ContentPane({title : "X",content:"Yello"});

    this.ps = new museum.PoseSequence({title:"V"});
   
    this.addChild(this.ps);
    this.addChild(cp2);
    this.startup();
  },

	setHeight: function(height) {
		console.log("Setting posesquence widget height to ", height);
		dojo.style(this.domNode, "height", height+"px");
	}

});
