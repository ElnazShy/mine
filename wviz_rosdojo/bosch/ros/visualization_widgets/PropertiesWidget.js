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

PropertiesWidget = Class.extend({
    init: function() {
	this.type = "PropertiesWidget";
	this.id='';
	this.dialog_html='';
	this.button='';
	this.visWidget=[];
	this.h_space=0;
	this.v_space=0;
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

    setUpCallBacks: function(name){
	var that=this;
	
	// This is where we generate the html code
	// for the properties dialog
	if(that.dialog_html == ''){

	    // Here iterate through the properties of the visualization widget and 
	    // add appropriate form elements in the dialog's html
	    // Let's begin from generating the title
	    that.dialog_html= '<div id="'+name+'_dialog" title="'+name+'">';

	    // Now let's go through the keys of whatever widget we are trying to show properties
	    // and put a text box for those keys
	    // console.debug(this.visWidget.keys);

	    // Start generating a form
	    that.dialog_html=that.dialog_html+'<div id="form"> <form>';
	    
	    // Put the left pane here
	    that.dialog_html=that.dialog_html+'<div id="leftpane">';
	    
	    for(var k in that.visWidget.keys){
		// k is the index string; the name of the property.
		// this.visWidget.keys[k] returns the value of the property.
		if( k == "color"){

		    // Convert object's color into hex
		    var rgbInHex = that.visWidget.color[2]*255 | ( that.visWidget.color[1]*255<< 8) | (that.visWidget.color[0]*255 << 16);

		    // console.log("When generating the HTML rgbInHex:");
		    // console.log(rgbInHex);
		    // console.log(rgbInHex.toString(16))


		    // Set palette color
		 
		    // I was going to use this but changed my mind
		    //that.dialog_html=that.dialog_html +'<div id="label">'+ k + '</div> <div id="palette" style="background-color:#'+rgbInHex.toString(16)+'"></div>';

		    // This input box is special, in that, it's not clickable (readonly)
		    // and that its background color depends on the color of the vis. wdgt.
		    that.dialog_html=that.dialog_html +'<div id="label">'+ k + '</div> <div id="textbox"> <input type="text" name="'+name+'_'+k+'_input" readonly="readonly" style="background-color:#'+rgbInHex.toString(16)+'; color:#'+rgbInHex.toString(16)+';" value="'+that.visWidget.keys[k]+'"></div>';
		    
		}
		else{
		    
		    // If the property of the widget is not "color"
		    // then just add its label and a textbox
		    that.dialog_html=that.dialog_html +'<div id="label">'+ k + '</div> <div id="textbox"> <input type="text" name="'+name+'_'+k+'_input" value="'+that.visWidget.keys[k]+'"> </div>';
		}
	    }

	    // Close the leftpane
	    that.dialog_html=that.dialog_html + '</div>';

	    // Put a rightpane here
	    that.dialog_html=that.dialog_html+'<div id="rightpane">';

	    // Rainbow slide yay!
	    that.dialog_html=that.dialog_html +'<div id="picker"></div><div id="slide"></div>';
	    
	    // Close the rightpane
	    that.dialog_html=that.dialog_html+'</div>';

  	    // Add a Save and a Cancel button and finish generating the div 
	    // first </div> is for div class="form", id: name_properties_form
	    // second </div> is for div id: name_properties_dialog
	    that.dialog_html=that.dialog_html +'<button type="button", id="'+name+'_save_button"><center>Save</center></button> <button type="button", id="'+name+'_cancel_button"><center>Cancel</center></button> </form> </div> </div>'; 
	}

	// This is triggered when the user clicks on, for example, Grid_1_properties button in Visualization Control Panel
	jQuery('#'+name+'_button').click(function(e){
	    
	    console.log("Opening the properties dialog");
	    console.log(that.visWidget);

	    var temp_visWidget = that.visWidget;

	    // The following call generates a dialog using the html we generated previously
	    $(that.dialog_html).dialog({
		open: function(event, ui) {
		    // Refresh the input text fields
		    for(var k in temp_visWidget.keys){
			console.log(name);
			console.log(k);
			console.log(temp_visWidget.keys[k]);

			
			if( k == "color"){

			    // Convert object's color into hex
			    var rgbInHex = temp_visWidget.keys[k][2]*255 | (temp_visWidget.keys[k][1]*255 << 8) | (temp_visWidget.keys[k][0]*255 << 16);

			    
			    // Convert the rgb value in hex and pad the string with zeros
			    // if it's shorter than 6 letters.
			    rgbInHex = that.padding(rgbInHex.toString(16));
				
			    console.log("When opening the dialog RGB Color value converted in Hex");
			    console.log(rgbInHex)
			    
			    document.getElementsByName(name+'_'+k+'_input')[0].style.backgroundColor = "#"+rgbInHex;
			    document.getElementsByName(name+'_'+k+'_input')[0].style.color = "#"+rgbInHex;
			    document.getElementsByName(name+'_'+k+'_input')[0].value = temp_visWidget.keys[k];
			}
			else{
			    document.getElementsByName(name+'_'+k+'_input')[0].value = temp_visWidget.keys[k];
			}
			//console.log(document.getElementsByName(name+'_'+k+'_input')[0]);
		    }

		    
		},
		
		beforeClose: function(event, ui) {
		    // This is called when the user clicks on the X at the top-right corner
		    // Note that jQuery holds the state of the DOM and if we don't remove
		    // the dialog div's html from the DOM, its callbacks are only set-up
		    // once when we open it first. However if we remove it whenever we close
		    // and re-create every time we open it, callbacks are set up properly.
		    $('#'+name+'_dialog').remove();
		    
		},
		height: 480, 
		width: 640
	    });
	    
	    // We're injecting css for:
	    //   - our color picker, and 
	    //   - organizing labels and textboxes.
	    $('#'+name+'_dialog').append('<style type="text/css">#leftpane {float: left; width: 300px; height: 200px;}#rightpane {float: left; width: 50px; height: 200px;}#form { width: 500px; height: 200px;}#label { float: left; width: 100px; }#textbox { float: left; width: 200px; }#picker { width: 0px; height: 0px; }#slide { width: 30px; height: 100px; }#palette { float: left; height: 20px; width: 20px; }</style> <script type="text/javascript"src="js/ros/visualization_widgets/colorpicker.js"></script>');	    

	    // Just in case redraw was set to 1 previously reset it.
	    that.visWidget.redraw=0;
	    
	    //ros_debug("You clicked on "+name);
	    //console.log(that.dialog_html);
	    
	    // All the callbacks that will be called from the buttons inside thise
	    // property dialog should go in here. That way, when the dialog is created
	    // callbacks for the buttons will also be set up.

	    // Now here, iterate through the properties of the visualization widget and
	    // add callbacks for the form elements we previously added in dialog's html
	    jQuery('#'+name+'_save_button').click(function(e){
		
	     	that.visWidget.redraw=1;
	     	
	     	//that.visWidget.resolution = Number($('#'+name+'_'+k+'properties_dialog input').val());
	     	//console.log(Number($('#'+name+'_properties_dialog input').val()));

		// Let's iterate through our textboxes and save their values into our variables
		for(var k in that.visWidget.keys){


		    // Get the widget's attribute's type
		    var attrType = Object.prototype.toString.call(that.visWidget.keys[k]).match(/^\[object (.*)\]$/)[1];
		    
		    
		    //eval('that.visWidget.'+that.visWidget.keys[k]+'='+document.getElementsByName(name+'_'+k+'_input')[0].value);		    
		    var my_eval_string = "that.visWidget."+k+"=";
		    
		    //console.log("Spitting the current value of: "+name+"_"+k+"_input");
		    //console.log(document.getElementsByName(name+'_'+k+'_input')[0]);
		    console.log("ATTR NAME:");
		    console.log(k);

		    if( attrType == "Array" ){

			console.log("ATTR TYPE is Array");	

		     	my_eval_string = my_eval_string + "[" + document.getElementsByName(name+"_"+k+"_input")[0].value.toString() + "];";
			var my_array = document.getElementsByName(name+"_"+k+"_input")[0].value.split(",");
			// TODO We should check the array length in a smart way
			var key_value = [Number(my_array[0]),Number(my_array[1]),Number(my_array[2])];
			
		    }
		    else if(attrType == "String" ){
			console.log("ATTR TYPE is String");
			
			my_eval_string = my_eval_string +"\"" +document.getElementsByName(name+"_"+k+"_input")[0].value.toString() +"\";";
			var key_value = document.getElementsByName(name+"_"+k+"_input")[0].value.toString();
		    }
		    else if(attrType == "Number") {
			console.log("ATTR TYPE is Number");
		     	my_eval_string = my_eval_string + "Number("+document.getElementsByName(name+"_"+k+"_input")[0].value.toString() +");";
			var key_value = Number(document.getElementsByName(name+"_"+k+"_input")[0].value);
		    }
		    		    
		    //console.log("Trying to evaluate the following:");
		    //console.log(my_eval_string);

		    // This will update the attributes of our visualization widget object
		    eval(my_eval_string);

		    // We should also update the keys of our visualization widget object
		    // Becasue this is where we read the key values from when we open
		    // the dialog
		    that.visWidget.keys[k] = key_value;
		   
		}
		//console.log("Closing the properties dialog");
		//console.log(that.visWidget);

		// At this point, name has already the suffix properties
		// such as: "blah_N_properties". That
		$('#'+name+'_dialog').dialog('close');
		
	    });

	    jQuery('#'+name+'_cancel_button').click(function(e){
		// Close the dialog without changing anything
		$('#'+name+'_dialog').dialog('close');
	    });

	    // Open the color picker's rainbow slide here
	    ColorPicker(
		document.getElementById('slide'),
		
		// old
		//document.getElementById('palette');
		
		// new
		// For the color textbox we don't have an id, so we get it by its name
		document.getElementsByName(name+'_color_input')[0],
		
		function(hex, hsv, rgb) {
		    
		    //console.log("COLOR PICKER SAYS hex is:");
		    //console.log(hex);

		    
		    //old
		    //document.getElementById('palette').style.backgroundColor=hex;
		    document.getElementsByName(name+'_color_input')[0].style.backgroundColor=hex;
		    
		    document.getElementsByName(name+'_color_input')[0].style.color=hex;
		    document.getElementsByName(name+'_color_input')[0].value=[Number(rgb.r/255), Number(rgb.g/255), Number(rgb.b/255)];
		   
		    //console.log(rgb);
		    //ros_debug(Number(rgb.r/255));
		    //ros_debug(Number(rgb.g/255));
		    //ros_debug(Number(rgb.b/255));
		    
		    that.visWidget.color = [Number(rgb.r/255), Number(rgb.g/255), Number(rgb.b/255)];
		    that.visWidget.redraw=1;
		}
	    );
	    
	    // Let's show the color picker slide when the user clicks on the small palette
	    jQuery('#palette').click(function(e){
		// What is going to happen when we click on the palette?
	    });
	});	
    },

    getHtml: function(name){
	//var that=this;
	
	//htmlstring='';
	//return htmlstring;
    },
    
    // addVisualization();
    setNode:function(node){
	this.node=node;
    },
    
});