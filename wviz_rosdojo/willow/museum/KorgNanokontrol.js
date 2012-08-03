dojo.provide("museum.KorgNanokontrol");

dojo.require("museum.KorgSlider");

dojo.require("dijit.form.Button");
dojo.require("dijit.form.NumberSpinner");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("museum.KorgNanokontrol", [dijit._Widget, dijit._Templated], {
	
	// Internal variables
  sliderList : ["TILT","PAN","LIFT","UPPER","ELBOW","FOREARM","WRIST","GRIP","TORSO"],
	templateString: dojo.cache("museum", "templates/KorgNanokontrol"),
	last_msg: {},
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
		this.button["Backward"] = this.addButton("Backward",this.prev);
		this.button["Play"] = this.addButton("Play",this.play);
		this.button["Forward"] = this.addButton("Forward",this.next);
		this.button["Rec"]  = this.addButton("Rec",this.rec);
		this.button["Save"] = this.addButton("Save",this.save);
		this.button["Refresh"] = this.addButton("Refresh",this.refresh);

    this.createTimeSpinner();
   },

  createTimeSpinner : function() {
    var p = document.createElement('p');
    p.innerText = "Time : ";
    this.buttonsAttach.appendChild(p);
    this.timeSpinner = new dijit.form.NumberSpinner({
                                          value:5.0,
                                          smallDelta:0.1,
                                          constraints: { min:0.1, max:10},
                                          style:"width:75px"
                                         }
                                         );
    
    p.appendChild(this.timeSpinner.domNode);
  },


  createRightSide : function() {
    this.createSliders();
  },

  setPoseTabs : function(tabs) {
    this.poseTabs = tabs;
  },

  createSliders : function() {
    this.slider = {};

    for(i in this.sliderList) {
      var name = this.sliderList[i];
      this.slider[name] = this.addSlider(name);
    }
	},

	addButton : function(name) {
    var iconname = name+'icon';
		var btn = new dijit.form.Button({title:name, iconClass:iconname, showLabel:false});
		this.connect(btn,"onClick",name);
		this.buttonsAttach.appendChild(btn.domNode);
		return btn;
	},

	addSlider: function(name) {
		var slider = new museum.KorgSlider({label:name});
		this.connect(slider, "onSliderMoved", "virtualKorgChanged");
		this.slidersAttach.appendChild(slider.domNode);
		return slider;
	},
	
	korgMessageReceived: function(msg) {
		this.last_msg = msg;

    for(i in this.sliderList) {
      var name = this.sliderList[i];
      this.slider[name].setValue(msg.axes[i]);
    }
	},
	
	virtualKorgChanged: function() {
		var msg = {};
		if (this.last_msg.axes) {
			msg.axes = this.last_msg.axes;
		} else {
			msg.axes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		}
		if (this.last_msg.buttons) {
			msg.buttons = this.last_msg.buttons;
		} else {
			msg.buttons = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		}

    for(var i in this.sliderList) {
      var name = this.sliderList[i];
      msg.axes[i] = this.slider[name].value;
    }

    if(ros.publish) {
		  console.log('publishing...')
		  ros.publish("/korg_joy", "sensor_msgs/Joy", dojo.toJson(msg));
    }
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
  
	},

});
