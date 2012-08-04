dojo.provide("museum.KorgNanokontrol");

dojo.require("museum.KorgSlidersControl");

dojo.require("dijit.form.Button");
dojo.require("dijit.form.ComboButton");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("museum.KorgNanokontrol", [dijit._Widget, dijit._Templated], {
  
	templateString: dojo.cache("museum", "templates/KorgNanokontrol"),
	visualization : null,
	sequence : null,
	
	postCreate: function() {
    this.createLeftSide();
    this.createRightSide();

		ros.subscribe("/korg_joy", dojo.hitch(this, "korgMessageReceived"), -1, "sensor_msgs/Joy");
  },

	setVisualization : function(vis) {
		this.visualization = vis;
	},

	setSequence : function(seq) {
		this.sequence = seq;
	},
  
  createLeftSide : function() {
		this.button = {};
		this.button["Rec"]  = this.addButton("Rec");
		this.button["Save"] = this.addButton("Save");
		this.button["Refresh"] = this.addButton("Refresh");

    this.createTimeSpinner(this.buttonsAttach);
    this.createModeChanger(this.buttonsAttach);
   },

  createTimeSpinner : function(attachPoint) {
    var p = document.createElement('p');
    p.innerText = "Time : ";
    this.timeSpinner = new dijit.form.NumberSpinner({
                                          value:3.0,
                                          smallDelta:0.2,
                                          constraints: { min:0.1, max:6},
                                          style:"width:75px"
                                         }
                                         );
    
    p.appendChild(this.timeSpinner.domNode);
    attachPoint.appendChild(p);
  },

  createModeChanger : function(attachPoint) {
    var that = this;
    this.modeButton = new dijit.form.ComboButton({label:'Slider Mode'});
    dojo.style(this.modeButton.domNode,'width','200px');
    var menu = new dijit.Menu({style:"display:none;"});
    var menuitem1 = new dijit.MenuItem({
      label:"Slider Mode",
      onClick:function() { that.modeButton.attr('label','Slider Mode'); that.setMode('Slider')}
      }); 
    menu.addChild(menuitem1);

    var menuitem2 = new dijit.MenuItem({
      label:"Manniquin Mode",
      onClick:function() { that.modeButton.attr('label','Manniquin Mode'); that.setMode('Manniquin')}
      }); 
    menu.addChild(menuitem2);

    this.modeButton.attr('dropDown',menu);
    attachPoint.appendChild(this.modeButton.domNode);
  },

  setMode : function(mode) {
    console.log(mode);
  },

  createRightSide : function() {
    this.sliderControl = new museum.KorgSlidersControl({attachPoint:this.slidersAttach,korgChanged:this.onKorgChange});
  },

  onKorgChange : function(msg) {
    if(ros.publish) {
  	  console.log('publishing...')
  	  ros.publish("/korg_joy", "sensor_msgs/Joy", dojo.toJson(msg));
    }
  },

  setPoseTabs : function(tabs) {
    this.poseTabs = tabs;
  },

	addButton : function(name) {
    var iconname = name+'icon';
		var btn = new dijit.form.Button({title:name, iconClass:iconname, showLabel:false});
		this.connect(btn,"onClick",name);
		this.buttonsAttach.appendChild(btn.domNode);
		return btn;
	},

	korgMessageReceived: function(msg) {
    this.sliderControl.korgMessageReceived(msg);
	},
	
  Play : function()
  {
    console.log("Play");
  },

  Backward : function()
  {
    console.log("Backward Pressed");
   // this.poseTabs.Prev();
  },                    	

  Forward : function()
  {
    console.log("Forward");
    //this.poseTabs.Next();
  },

  Rec : function()
  {
    console.log("Rec Pressed");
		/*
		this.visualization.generatePreview(function(imgPreview) {
			console.log("Adding the pose to the pose sequence");
	    that.sequence.addPose(korgState, imgPreview);
		});*/
  },

  Save : function()
  {
    console.log("Save Pressed");
  },

	Refresh : function() {
    console.log("Refresh Pressed");
  
	},

});
