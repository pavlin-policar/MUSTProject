var Component, Graph, Parameter, Point, Polygon, mathFunctionDictionary, stripBrackets,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

stripBrackets = function(str) {
  return str.replace(/[\[\]\(\)]/g, '');
};

mathFunctionDictionary = function(str) {
  str = str.replace(/(?:Math\.)?(E|PI|SQRT2|SQRT1_2|LN2|LN10|LOG2E|LOG10E)/g, "Math.$1");
  return str = str.replace(/(?:Math\.)?(abs|acos|acosh|asin|asinh|atan|atanh|atan2|cbrt|ceil|clz32|cos|cosh|exp|expm1|floor|fround|hypot|imul|log|log1p|log10|log2|max|min|pow|random|round|sign|sin|sinh|sqrt|tan|tanh|trunc)/gi, "Math.$1");
};

Component = (function() {
  function Component(name, definition) {
    this.name = name;
    this.definition = definition;
    this.obj = null;
  }

  Component.prototype.generate = function() {
    throw new Error("Not implemented!");
  };

  return Component;

})();

Point = (function(superClass) {
  extend(Point, superClass);

  function Point() {
    return Point.__super__.constructor.apply(this, arguments);
  }

  Point.prototype.generate = function() {
    return this.obj = JSXGen.elements.board.create('point', [this.definition[0], this.definition[1]], {
      showInfobox: JSXGen.localOptions.point.showInfobox
    });
  };

  return Point;

})(Component);

Polygon = (function(superClass) {
  extend(Polygon, superClass);

  function Polygon() {
    return Polygon.__super__.constructor.apply(this, arguments);
  }

  Polygon.prototype.generate = function() {
    var defObj, i, len, points, ref;
    points = [];
    ref = this.definition;
    for (i = 0, len = ref.length; i < len; i++) {
      defObj = ref[i];
      points.push(defObj.obj);
    }
    if (points.length < 3) {
      throw new Error("Error generating polygon. Requires at least 3 points!");
    }
    return this.obj = JSXGen.elements.board.create('polygon', points);
  };

  return Polygon;

})(Component);

Graph = (function(superClass) {
  extend(Graph, superClass);

  function Graph() {
    return Graph.__super__.constructor.apply(this, arguments);
  }

  Graph.prototype.generate = function() {
    var color, ref;
    color = (ref = JSXGen.elements.color[0]) != null ? ref : 'blue';
    JSXGen.elements.color.shift();
    return this.obj = JSXGen.elements.board.create('functiongraph', (function(x) {
      return eval(this.def);
    }), {
      strokeColor: color
    });
  };

  return Graph;

})(Component);

Parameter = (function() {
  function Parameter(key, value) {
    this.key = key;
    this.value = value;
  }

  return Parameter;

})();

window.JSXGen || (window.JSXGen = {
  boardOptions: {
    showCopyright: false,
    showNavigation: true,
    axis: true,
    grid: true,
    boundingBox: [-6, 6, 6, -6],
    zoom: false,
    pan: false,
    keepaspectratio: false
  },
  localOptions: {
    point: {
      showInfoBox: true
    }
  },
  elements: {
    board: null,
    colors: ['blue', 'red', 'green', 'orange', 'black', 'grey'],
    Point: Point,
    Polygon: Polygon,
    Graph: Graph
  },
  getParams: function() {
    var i, index, len, nameVal, pairs, param, paramString, params;
    index = document.URL.indexOf('?');
    paramString = document.URL.substring(index + 1, document.URL.length);
    paramString = decodeURI(paramString);
    params = [];
    if (index !== -1) {
      pairs = paramString.split('&');
      for (i = 0, len = pairs.length; i < len; i++) {
        param = pairs[i];
        nameVal = param.split('=');
        params.push(new Parameter(nameVal[0], nameVal[1]));
      }
    }
    return params;
  },
  initBoard: function(domElement, params) {
    this.applyParams(params);
    this.elements.board = JXG.JSXGraph.initBoard(domElement, this.boardOptions);
    return this.elements.board;
  },
  applyParams: function(params) {
    var color, data, i, j, len, len1, param;
    for (i = 0, len = params.length; i < len; i++) {
      param = params[i];
      switch (param.key) {
        case 'minx':
          if (param.value < this.boardOptions.boundingBox[2]) {
            this.boardOptions.boundingBox[0] = param.value;
          }
          break;
        case 'maxy':
          if (param.value > this.boardOptions.boundingBox[3]) {
            this.boardOptions.boundingBox[1] = param.value;
          }
          break;
        case 'maxx':
          if (param.value > this.boardOptions.boundingBox[0]) {
            this.boardOptions.boundingBox[2] = param.value;
          }
          break;
        case 'miny':
          if (param.value < this.boardOptions.boundingBox[1]) {
            this.boardOptions.boundingBox[3] = param.value;
          }
          break;
        case 'grid':
          if (param.value === 'f' || param.value === '0') {
            this.boardOptions.grid = false;
          }
          break;
        case 'axis':
          if (param.value === 'f' || param.value === '0') {
            this.boardOptions.axis = false;
          }
          break;
        case 'colors':
          data = stripBrackets(param.value);
          data = data.split(',');
          for (j = 0, len1 = data.length; j < len1; j++) {
            color = data[j];
            this.elements.colors.unshift(element);
          }
          break;
        case 'showTCoords':
          if (param.value === 'f' || param.value === '0') {
            this.localOptions.point.showInfobox = false;
          }
      }
    }
    return true;
  }
});
