(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three', 'meshloader'], factory);
  }
  else {
    root.UrdfLoader = factory(root.THREE, root.MeshLoader);
  }
}(this, function(THREE, MeshLoader) {
  var UrdfLoader = function(meshloader){
    var urdfLoader = this;

    urdfLoader.load = function(objroot) {
      
      function urdfReady() {
        var 
      }

      
    }



  };

  return UrdfLoader;
}));
