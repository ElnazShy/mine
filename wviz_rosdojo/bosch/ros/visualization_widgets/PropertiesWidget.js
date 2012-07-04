/* Halit Bener Suay - Fixed-Term - Bosch CR-RTC/NA
 * 05/22/2012
*/

/* This widget will receive an existing node's
 * properties and will show a dialog where you can
 * modify them on the fly. Node properties are read
 * from the object itself. Depending on the type of
 * the property, this dialog show one or more of
 * the below:
 * - text input field
 * - drop-down field
 * - color-picker
 * - number scrolling thingy (what is it called again?)
*/

ros.visualization_widgets.PropertiesWidget = Class.extend({
    init: function(mySceneNode) {
	this.type = "PropertiesWidget";
	this.id='';
	this.dialog_html='';
	this.button='';
	this.sceneNode=mySceneNode;
	this.h_space=0;
	this.v_space=0;
	this.availableTopics=[];
	this.name='';
    },

    padding: function(str) {
	var pad = "";
	if(str.length < 6){
	    for(var i=str.length; i < 6; i=i+1){
		pad = pad + "0";
	    }
	}
	var padded = pad + str;
	return padded;
    },

    getHtml: function(name){

	this.name = name;
  this.saveID = name + '_saveButton';
  this.cancelID = name + '_cancelButton';
	
	// Just in case redraw was set to 1 previously reset it.
	this.sceneNode.redraw=0;

	// This is where we generate the html code
	// for the properties dialog
	if(this.dialog_html == ''){

	    // Here iterate through the properties of the visualization widget and 
	    // add appropriate form elements in the dialog's html
	    // Let's begin from generating the title
	    this.dialog_html= '<div id="'+name+'_dialog" title="'+name+'">';

	    // Now let's go through the keys of whatever widget we are trying to show properties
	    // and put a text box for those keys
	    // console.debug(this.sceneNode.keys);

	    // Start generating a form
	    this.dialog_html=this.dialog_html+'<div id="form"> <form>';
	    
	    // Put the left pane here
	    this.dialog_html=this.dialog_html+'<div id="leftpane">';
	    
	    for(var k in this.sceneNode.keys){
		// k is the index string; the name of the property.
		// this.sceneNode.keys[k] returns the value of the property.
		if( k == "color"){

		    // Convert object's color into hex
		    var rgbInHex = this.sceneNode.color[2]*255 | ( this.sceneNode.color[1]*255<< 8) | (this.sceneNode.color[0]*255 << 16);

		    // console.log("When generating the HTML rgbInHex:");
		    // console.log(rgbInHex);
		    // console.log(rgbInHex.toString(16))


		    // Set palette color
		    
		    // I was going to use this but changed my mind
		    //this.dialog_html=this.dialog_html +'<div id="label">'+ k + '</div> <div id="palette" style="background-color:#'+rgbInHex.toString(16)+'"></div>';

		    // This input box is special, in that, it's not clickable (readonly)
		    // and that its background color depends on the color of the vis. wdgt.
		    this.dialog_html=this.dialog_html +'<div id="label">'+ k + '</div> <div id="textbox"> <input type="text" name="'+name+'_'+k+'_input" readonly="readonly" style="background-color:#'+rgbInHex.toString(16)+'; color:#'+rgbInHex.toString(16)+';" value="'+this.sceneNode.keys[k]+'"></div>';
		    
		}
		else if( k == "topic"){
		    // If the property of the widget is topic then put a small button next to it
		    // When the user clicks on the button it will pop the list of available topics
		    this.dialog_html=this.dialog_html +'<div id="label">'+ k + '</div> <div id="textbox"> <input type="text" name="'+name+'_'+k+'_input" value="'+this.sceneNode.keys[k]+'"> </div><div id="choosetopic"><button type="button", id="'+name+'_choose_topic_button", style="width:30px;">...</button></div>';
		}
		else{
		    
		    // If the property of the widget is not "color"
		    // then just add its label and a textbox
		    this.dialog_html=this.dialog_html +'<div id="label">'+ k + '</div> <div id="textbox"> <input type="text" name="'+name+'_'+k+'_input" value="'+this.sceneNode.keys[k]+'"> </div>';
		}
	    }

	    // Close the leftpane
	    this.dialog_html=this.dialog_html + '</div>';

	    // Put a rightpane here
	    this.dialog_html=this.dialog_html+'<div id="rightpane">';

	    if("color" in this.sceneNode.keys){
		// Rainbow slide yay!
		this.dialog_html=this.dialog_html +'<div id="picker"></div><div id="slide"></div>';
	    }
	    
	    // Close the rightpane
	    this.dialog_html=this.dialog_html+'</div>';

  	    // Add a Save and a Cancel button and finish generating the div 
	    // first </div> is for div class="form", id: name_properties_form
	    // second </div> is for div id: name_properties_dialog
	    this.dialog_html=this.dialog_html +'<button type="button", id="'+this.saveID+'"><center>Save</center></button> <button type="button", id="'+this.cancelID+'"><center>Cancel</center></button> </form> </div> </div>'; 
	}	
	
	// If the scene node has a color property exposed,
	// Open the color picker's rainbow slide here
	if("color" in this.sceneNode.keys){
	    ColorPicker(
		document.getElementById('slide'),
		
		// old
		//document.getElementById('palette');
		
		// new
		// For the color textbox we don't have an id, so we get it by its name
		document.getElementsByName(this.name+'_color_input')[0],
		
		function(hex, hsv, rgb) {
		    
		    //console.log("COLOR PICKER SAYS hex is:");
		    //console.log(hex);

		    
		    //old
		    //document.getElementById('palette').style.backgroundColor=hex;
		    document.getElementsByName(this.name+'_color_input')[0].style.backgroundColor=hex;
		    
		    document.getElementsByName(this.name+'_color_input')[0].style.color=hex;
		    document.getElementsByName(this.name+'_color_input')[0].value=[Number(rgb.r/255), Number(rgb.g/255), Number(rgb.b/255)];
		    
		    //console.log(rgb);
		    //ros_debug(Number(rgb.r/255));
		    //ros_debug(Number(rgb.g/255));
		    //ros_debug(Number(rgb.b/255));
		    
		    this.sceneNode.color = [Number(rgb.r/255), Number(rgb.g/255), Number(rgb.b/255)];
		    this.sceneNode.redraw=1;
		}
	    );
	}	
	return this.dialog_html;
    },

    onOpen: function(){
	
	// Just in case redraw was set to 1 previously reset it.
	this.sceneNode.redraw=0;

	// Refresh the input text fields
	for(var k in this.sceneNode.keys){
	    console.log(this.name);
	    console.log(k);
	    console.log(this.sceneNode.keys[k]);

	    
	    if( k == "color"){

		// Convert object's color into hex
		var rgbInHex = this.sceneNode.keys[k][2]*255 | (this.sceneNode.keys[k][1]*255 << 8) | (this.sceneNode.keys[k][0]*255 << 16);

		
		// Convert the rgb value in hex and pad the string with zeros
		// if it's shorter than 6 letters.
		rgbInHex = this.padding(rgbInHex.toString(16));
		
		console.log("When opening the dialog RGB Color value converted in Hex");
		console.log(rgbInHex)
		
		document.getElementsByName(this.name+'_'+k+'_input')[0].style.backgroundColor = "#"+rgbInHex;
		document.getElementsByName(this.name+'_'+k+'_input')[0].style.color = "#"+rgbInHex;
		document.getElementsByName(this.name+'_'+k+'_input')[0].value = this.sceneNode.keys[k];
	    }
	    else{
		document.getElementsByName(this.name+'_'+k+'_input')[0].value = this.sceneNode.keys[k];
	    }
	    //console.log(document.getElementsByName(name+'_'+k+'_input')[0]);
	}
    },

    onClose: function(){
	// What to do?
    },

    onSave: function(){
	
	this.sceneNode.redraw=1;
	
	//this.sceneNode.resolution = Number($('#'+name+'_'+k+'properties_dialog input').val());
	//console.log(Number($('#'+name+'_properties_dialog input').val()));

	// Let's iterate through our textboxes and save their values into our variables
	for(var k in this.sceneNode.keys){


	    // Get the widget's attribute's type
	    var attrType = Object.prototype.toString.call(this.sceneNode.keys[k]).match(/^\[object (.*)\]$/)[1];
	    
	    
	    //eval('this.sceneNode.'+this.sceneNode.keys[k]+'='+document.getElementsByName(name+'_'+k+'_input')[0].value);		    
	    var my_eval_string = "this.sceneNode."+k+"=";
	    
	    //console.log("Spitting the current value of: "+name+"_"+k+"_input");
	    //console.log(document.getElementsByName(name+'_'+k+'_input')[0]);
	    console.log("ATTR NAME:");
	    console.log(k);

	    if( attrType == "Array" ){

		console.log("ATTR TYPE is Array");	

		my_eval_string = my_eval_string + "[" + document.getElementsByName(this.name+"_"+k+"_input")[0].value.toString() + "];";
		var my_array = document.getElementsByName(this.name+"_"+k+"_input")[0].value.split(",");
		// TODO We should check the array length in a smart way
		var key_value = [Number(my_array[0]),Number(my_array[1]),Number(my_array[2])];
		
	    }
	    else if(attrType == "String" ){
		console.log("ATTR TYPE is String");
		
		my_eval_string = my_eval_string +"\"" +document.getElementsByName(this.name+"_"+k+"_input")[0].value.toString() +"\";";
		var key_value = document.getElementsByName(this.name+"_"+k+"_input")[0].value.toString();
	    }
	    else if(attrType == "Number") {
		console.log("ATTR TYPE is Number");
		my_eval_string = my_eval_string + "Number("+document.getElementsByName(this.name+"_"+k+"_input")[0].value.toString() +");";
		var key_value = Number(document.getElementsByName(this.name+"_"+k+"_input")[0].value);
	    }
	    
	    //console.log("Trying to evaluate the following:");
	    //console.log(my_eval_string);

	    // This will update the attributes of our visualization widget object
	    eval(my_eval_string);

	    // We should also update the keys of our visualization widget object
	    // Becasue this is where we read the key values from when we open
	    // the dialog
	    this.sceneNode.keys[k] = key_value;
	    
	}
    },
    
    onCancel: function(){
	// What to do?
    },
    
    getCSS: function(){
	var myCSS = '<style type="text/css">#leftpane {float: left; width: 330px; height: 200px;}#rightpane {float: left; width: 50px; height: 200px;}#form { width: 500px; height: 200px;}#label { float: left; width: 100px; }#textbox { float: left; width: 200px; }#picker { width: 0px; height: 0px; }#choosetopic {float: left; width: 30px; }#slide { width: 30px; height: 100px; }#palette { float: left; height: 20px; width: 20px; }</style> <script type="text/javascript"src="js/ros/visualization_widgets/colorpicker.js"></script>';
	return myCSS;
    },
    
});
