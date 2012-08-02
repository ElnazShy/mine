dojo.provide("userstudy.ImageSegmentation");

dojo.requrie("userstudy.Utils");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("userstudy.ImageSegmentation", [dijit._Widget, dijit._Templated], {

  templateString : dojo.cache("userstudy", "templates/ImageSegmentation.html");

  postCreate : function() {
    this.createCanvas();
  },

  createCanvas : function() {
    this.canvas = document.createElement('canvas'); 
    this.canvas.width = "800px"
    this.canvas.height = "600px"
    this.canvas.setAttribute("style","border: 2px solid black");

    var source = loadVisualizationModule("lib/processingjs.min.js");
    console.log(source);
    this.processingIns = new Processing(this.canvas,source);
    this.canvasAttach.appendChild(this.canvas);
  },
    
});
