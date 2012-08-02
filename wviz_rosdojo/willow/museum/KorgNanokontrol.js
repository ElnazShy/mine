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
	
	postCreate: function() {
    this.createLeftSide();
    this.createRightSide();

		ros.subscribe("/korg_joy", dojo.hitch(this, "korgMessageReceived"), -1, "sensor_msgs/Joy");
  },
  
  createLeftSide : function() {
		this.button = {};
		this.button["Play"] = this.addButton("Play",this.play);
		this.button["Prev"] = this.addButton("Prev",this.prev);
		this.button["Next"] = this.addButton("Next",this.next);
		this.button["Rec"]  = this.addButton("Rec",this.rec);
		this.button["Save"] = this.addButton("Save",this.save);

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
    var iconname = 'mybutton ' + name
		var btn = new dijit.form.Button({title:name, iconClass:iconname });
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

  Prev : function()
  {
    console.log("Prev Pressed");
   // this.poseTabs.Prev();
  },                    	

  Next : function()
  {
    console.log("Next");
    //this.poseTabs.Next();
  },

  Rec : function()
  {
    console.log("Rec Pressed");
  },

  Save : function()
  {
    console.log("Save Pressed");
  },

});
