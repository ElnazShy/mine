	setMenu : function() {
		var editButton = this.createButton();
	},
					

	createButton : function() {
		// add Edit Button
		var editBtn = new dijit.form.DropDownButton({iconClass:'Editicon', dropDownPosition:["after","below"]});
		var editTooltip = this.createEditTooltip(); 
		editBtn.attr('dropDown',editTooltip);
		this.editBtn= editBtn;
//		this.connect(editBtn,"onClick","editPose");
		this.menuAttach.appendChild(editBtn.domNode);

		// add Remove Button
	},

	createEditTooltip : function() {
		var tooltip = new dijit.TooltipDialog({refreshOnShow: true});

		// pose editor
		var content = this.createFieldEditor();

		// create save button
		var saveBtn = new dijit.form.Button({label:"Save"});
		this.connect(saveBtn,"onClick","onSave");
		content.appendChild(saveBtn.domNode);

		// create cancel button
		var cancelBtn = new dijit.form.Button({label:"Cancel"});
		this.connect(saveBtn,"onClick","onCancel");
		content.appendChild(cancelBtn.domNode);

		tooltip.attr('content',content);
	},
								 

	// iterate all field of robot pose and creates text boxes for all of them.
	createFieldEditor : function() {
		var div = document.createElement('div');
		// head - pan, tilt
		var head = document.createElement('label');
		head.innerHtml = "Head";
		div.appendChild(head);
		this.newLine(div);
		console.log(this.pose);
		for(var i in this.pose.head) 
			this.addTextBox(this.pose.headName[i],this.pose.head[i],div);

		// torso
		this.addTextBox('Torso Lift',this.pose.torso.lift,div);
		this.newLine(div);

		// Left
		var left = document.createElement('label');
		left.innerHtml = "Left";
		div.appendChild(left);
		this.newLine(div);
		for(var i in this.pose.left)
			this.addTextBox(this.pose.leftName[i],this.pose.left[i],div);

		// right 
		var right = document.createElement('label');
		right.innerHtml = "Right";
		div.appendChild(right);
		this.newLine(div);
		for(var i in this.pose.right)
			this.addTextBox(this.pose.rightName[i],this.pose.right[i],div);
		this.newLine(div);

		return div;
	},

	// creates label for key, and textbox with p.value in it. Then attach to div
	addTextBox : function(key, value, div)
	{
		var label = document.createElement('label');
		label.innerHtml = key;
		div.appendChild(label);
		var textbox = new dijit.form.TextBox({});
		textbox.attr('value',value);
		div.appendChild(textbox.domNode);
		this.newLine(div);
	},

	newLine : function(div) {
    var br = document.createElement('br');
    div.appendChild(br);                  						
	},


	onSave : function(event) {
		console.log("Save");
		this.showTooltip(this.editBtn,"updated");
	},

	onCancel : function(event) {
	},


  // Shows a tooltip for 3 seconds with the message provided                                              
  showTooltip : function(btn,label) {
     if (this.tooltipTimer) {
         window.clearTimeout(this.tooltipTimer);
     }
     dijit.showTooltip(label, btn.domNode, [ "after", "above", "below", "before" ]);
     this.tooltipTimer = window.setTimeout(dojo.hitch(this, "hideTooltip"), 2000);
   },
