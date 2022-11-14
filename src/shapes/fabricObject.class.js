import { InteractiveFabricObject } from '../mixins/object_interactivity.mixin';

// TODO somehow we have to make a tree-shakeable import

export { InteractiveFabricObject as FabricObject };

export { fabricObjectDefaultValues } from './object.class';

(function (global) {
  const fabric = global.fabric;
  fabric.Object = InteractiveFabricObject;
})(typeof exports !== 'undefined' ? exports : window);
