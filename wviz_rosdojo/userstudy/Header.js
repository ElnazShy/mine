dojo.provide("userstudy.Header");

dojo.require("dijit.form.Button");

dojo.require("dijit._Widget");
dojo.require("dijit.Dialog");

dojo.declare("userstudy.Header",dijit._Widget, {

  boardID : null,
  dialog : null,
  interfaceList : [],
  launchService : '/laucher',
  interfaceFile : dojo.cache("userstudy","json/interface.json"),

  postCreate : function() {
    this.interfaces = dojo.fromJson(this.interfaceFile);

    var button = new dijit.form.Button({label:"Open"});
    this.connect(button,"onClick","openDialog");
    this.domNode.appendChild(button.domNode);

    var dialog = new dijit.Dialog({refreshOnShow:true});
    dojo.style(dialog.domNode,"width","90%");
    dojo.style(dialog.domNode,"height","90%");
    dojo.style(dialog.domNode,"background","white");

    var content = this.createDialog();
    dialog.attr('title',"User Study");
    dialog.attr('content',content);
    
    this.dialog = dialog;

    var board = dojo.byId(this.boardID);
    dojo.style(board,"background","grey");

    dialog.startup();
    //dialog.show();

  },

  openDialog : function(event) {
    console.log("Open");
    var content = this.createDialog();
    console.log(content);
    this.dialog.attr('content',content);
    this.dialog.show();
  },

  createDialog : function() {
    var html = document.createElement('div');
    console.log(this.interfaceList);
    for(i in this.interfaces.interfaces)
    {
      var btn = this.createButton(this.interfaces.interfaces[i].name);
      html.appendChild(btn.domNode);
    }
    this.lastdiv = document.createElement('div');
    html.appendChild(this.lastdiv);
    this.dialogHTML = html;

    return html;
  },

  createButton : function(name) {
    var button = new dijit.form.Button({label:name});
    this.connect(button,"onClick","selectInterface");

    return button;
  },

  selectInterface : function(event)
  {
    var selected = event.target.innerText; 

    //console.log(this.interfaces.interfaces);
    for(i in this.interfaces.interfaces)
    {
      if(selected == this.interfaces.interfaces[i].name){ 
        break;
      }
    }
    console.log(i);

    this.dialogHTML.removeChild(this.lastdiv);

    var div = document.createElement('div'); 
    var iframe = this.createTutorial(this.interfaces.interfaces[i].tutorialurl);
    div.appendChild(iframe);
    this.dialogHTML.appendChild(div);
    this.lastdiv = div;
    //this.launchInterface(event.target.innerText);
    this.createTutorial(selected);
    //this.createReadyButton(selected);
    //this.prepareInterface(selected);
  },

  createTutorial : function(url)
  {
    var iframe = document.createElement('iframe');
    iframe.setAttribute('src',url);
    iframe.setAttribute('width',420);
    iframe.setAttribute('height',315);
    console.log(iframe);
    return iframe;
  },

  launchInterface : function(name)
  {
    var message = dojo.toJson([{ interface_name : name }]);
    ros.callService(this.launchService,message,this.nop);
  },

  nop : function() {},
    
});
