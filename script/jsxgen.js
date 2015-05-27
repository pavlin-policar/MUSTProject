/**
 * Strip parentheses and angular brackets from given string
 * @param {string} data String to strip
 * @returns {string}    Cleaned string
 */
var stripBrackets = function (data) {
  return data.replace(/[\[\]\(\)]/g, '');
};

/**
 * To simplify url parameters, we can eliminate the need to write Math.xzy() every time we wish to use a builtin js
 * Math function.
 * @param input       Curve declaration containing builtin methods with various abbreviations
 * @returns {string}  String with correct replacements for macro functions
 */
var mathFunctionDictionary = function (input) {
  // Math constants ; Are case sensitive
  input = input.replace(/(E|PI|SQRT2|SQRT1_2|LN2|LN10|LOG2E|LOG10E)/g, "Math.$1");
  // Math methods ; Case insensitive
  input = input.replace(/(abs|acos|acosh|asin|asinh|atan|atanh|atan2|cbrt|ceil|clz32|cos|cosh|exp|expm1|floor|fround|hypot|imul|log|log1p|log10|log2|max|min|pow|random|round|sign|sin|sinh|sqrt|tan|tanh|trunc)/gi, "Math.$1");
  // possible future abbreviations for various other functions in this format
  // input = input.replace(/myfunction/gi, "javascriptFunction");
  return input;
};

(function () {
  /**
   * Component prototype, enforce overriding own generate method
   */
  var Component = function () {
    this.name = null;
    this.definition = null;
    this.obj = null;
  };
  Component.prototype.generate = function () {
    throw new Error("Not implemented!");
  };

  /**
   * Point component
   * @param {string} name
   * @param {array} definition Coordinates in array form [x,y]
   */
  var Point = function (name, definition) {
    this.name = name;
    this.definition = definition;
  };
  Point.prototype = new Component();
  Point.prototype.generate = function () {
    this.obj = JSXGen.elements.board.create('point',
      [this.definition[0], this.definition[1]],
      {showInfobox: JSXGen.localOptions.point.showInfobox}
    );
  };

  /**
   * Polygon component
   * @param {string} name
   * @param {array} definition  Array of point objects that will make up the polygon
   */
  var Polygon = function (name, definition) {
    this.name = name;
    this.definition = definition;
  };
  Polygon.prototype = new Component();
  Polygon.prototype.generate = function () {
    var pts = [];
    for (var i = 0; i < this.definition.length; i++) {
      pts.push(this.definition[i].obj);
    }

    if (pts.length < 3) {
      throw new Error('Error generating polygon: Requires at least 3 points.');
    }
    this.obj = JSXGen.elements.board.create('polygon', pts);
  };

  /**
   * Graph component
   * @param {string} name
   * @param {string} definition String with function definition, only supports basic operators (+,-,*,/)
   */
  var Graph = function (name, definition) {
    this.name = name;
    this.definition = mathFunctionDictionary(definition);
  };
  Graph.prototype = new Component();
  Graph.prototype.generate = function () {
    var color = JSXGen.elements.colors[0] || 'blue';
    JSXGen.elements.colors.shift();
    var def = this.definition;
    this.obj = JSXGen.elements.board.create('functiongraph',
      [function (x) {
        return eval(def);
      }],
      {strokeColor: color}
    );
  };

  /**
   * Public access JSXGen object
   * @type {JSXGen}
   */
  var JSXGen = JSXGen || {
      /**
       * Parameter object
       * @param {string} key
       * @param {mixed} value
       */
      Parameter: function (key, value) {
        this.key = key;
        this.value = value;
      },
      /**
       * Default JSX board options
       */
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

      /**
       * Various local options
       * @type {Object}
       */
      localOptions: {
        point: {
          showInfobox: true
        }
      },

      /**
       * Get paramters from URL
       * @returns {Array} Paramater objects
       */
      getParams: function () {
        var index = document.URL.indexOf('?');
        var paramString = document.URL.substring(index + 1, document.URL.length);
        paramString = decodeURI(paramString);

        var params = [];

        if (index !== -1) {
          var pairs = paramString.split('&');
          for (var i = 0; i < pairs.length; i++) {
            var nameVal = pairs[i].split('=');
            params.push(new this.Parameter(nameVal[0], nameVal[1]));
          }
        }
        return params;
      },
      /**
       * Initialize the board, return in case user want to implement other functionality, board will be save in JSXGen
       * object to later instantiate other objects
       * @param {string} domElement DOM element which will contain board
       * @param {array} params
       * @returns {JSXGraph.board}
       */
      initBoard: function (domElement, params) {
        this._applyParams(params);
        this.elements.board = JXG.JSXGraph.initBoard(domElement, this.boardOptions);
        return this.elements.board;
      },

      /**
       * Apply parameters to default board options
       * @param {array} params Array of Parameter objects
       */
      _applyParams: function (params) {
        var base = this;
        params.forEach(function (param) {
          switch (param.key) {
            case 'minx':
              if (param.value < base.boardOptions.boundingBox[2]) {
                base.boardOptions.boundingBox[0] = param.value;
              }
              break;
            case 'maxy':
              if (param.value > base.boardOptions.boundingBox[3]) {
                base.boardOptions.boundingBox[1] = param.value;
              }
              break;
            case 'maxx':
              if (param.value > base.boardOptions.boundingBox[0]) {
                base.boardOptions.boundingBox[2] = param.value;
              }
              break;
            case 'miny':
              if (param.value < base.boardOptions.boundingBox[1]) {
                base.boardOptions.boundingBox[3] = param.value;
              }
              break;
            case 'grid':
              if (param.value === 'f' || param.value === '0') {
                base.boardOptions.grid = false;
              }
              break;
            case 'axis':
              if (param.value === 'f' || param.value === '0') {
                base.boardOptions.axis = false;
              }
              break;
            case 'colors':
              var data = stripBrackets(param.value);
              data = data.split(',');
              data.forEach(function (element) {
                JSXGen.elements.colors.unshift(element);
              });
              break;
            case 'showTCoords':
              if (param.value === 'f' || param.value === '0') {
                JSXGen.localOptions.point.showInfobox = false;
              }
              break;
          }
        });
      },

      /**
       * Generation components
       */
      elements: {
        /**
         * Board object
         * @type {JSXGraph.board}
         */
        board: null,

        /**
         * Default colors to use for selected components
         */
        colors: ['blue', 'red', 'green', 'orange', 'black', 'grey'],
        Point: Point,
        Polygon: Polygon,
        Graph: Graph
      }
    };
  window.JSXGen = JSXGen;
})();