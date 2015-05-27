var JSXGen = JSXGen || {};

/**
 * JSXGen instance
 * Enables JSX graph generation via query vars
 * @author pavlin.g.p@gmail.com
 * @version 0.1.1
 */
var JSXGen = {
  /**
   * Parameter prototype
   * @param {string} name  Parameter name
   * @param {string} value Parameter value
   */
  Parameter: function (name, value) {
    this.name = name;
    this.value = value;
  },
  /**
   * Get parameters from query string
   * @return {array} Array of parameter objects
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
   * Local options
   * @type {Object}
   */
  localOptions: {
    point: {
      showInfobox: true
    }
  },
  /**
   * Initialize JSX board with given parameters
   * @param  {String}   domElement  DOM element id to create board around
   * @param  {array}    params      Query string parameters
   * @return {JSXBoard}             JSXBoard object
   */
  initBoard: function (domElement, params) {
    // default options
    var boardOptions = {
      showCopyright: false,
      showNavigation: true,
      axis: true,
      grid: true,
      boundingBox: [-6, 6, 6, -6],
      zoom: false,
      pan: false,
      keepaspectratio: false
    };

    params.forEach(function (param) {
      switch (param.name) {
        case 'minx':
          if (param.value < boardOptions.boundingBox[2])
            boardOptions.boundingBox[0] = param.value;
          break;
        case 'maxy':
          if (param.value > boardOptions.boundingBox[3])
            boardOptions.boundingBox[1] = param.value;
          break;
        case 'maxx':
          if (param.value > boardOptions.boundingBox[0])
            boardOptions.boundingBox[2] = param.value;
          break;
        case 'miny':
          if (param.value < boardOptions.boundingBox[1])
            boardOptions.boundingBox[3] = param.value;
          break;
        case 'grid':
          if (param.value === 'f' || param.value === '0')
            boardOptions.grid = false;
          break;
        case 'axis':
          if (param.value === 'f' || param.value === '0')
            boardOptions.axis = false;
          break;
        case 'colors':
          var data = stripBrackets(param.value);
          data = data.split(',');
          data.forEach(function (element) {
            JSXGen.elements._colors.unshift(element);
          });
          break;
        case 'showTCoords':
          JSXGen.localOptions.point.showInfobox = false;
          break;
      }
    });
    this.elements.board = JXG.JSXGraph.initBoard(domElement, boardOptions);
    return this.elements.board;
  },
  /**
   * JSX element definitions, each element should have a name property
   * and a generate method
   */
  elements: {
    /**
     * Element colors used for drawing components
     * @type {Array}
     */
    _colors: [
      'blue',
      'red',
      'green',
      'orange',
      'black',
      'grey'
    ],
    /**
     * Point prototype
     * @param {string} name   Point name for future reference
     * @param {array}  coords [x, y] coordinates
     */
    Point: function (name, coords) {
      this.name = name;
      this.coords = coords;

      this.generate = function () {
        if (!JSXGen.localOptions.point.showInfobox)
          this.obj = JSXGen.elements.board.create('point', [coords[0], coords[1]], {showInfobox: false});
        else this.obj = JSXGen.elements.board.create('point', [coords[0], coords[1]]);
      };
    },
    /**
     * Polygon prototype
     * @param {string} name   Polygon name for future reference
     * @param {array}  points Array of point names to use
     */
    Polygon: function (name, points) {
      this.name = name;
      this.points = points;

      this.generate = function () {
        var pts = [];
        for (var i = 0; i < this.points.length; i++)
          pts.push(this.points[i].obj);

        if (pts.length < 3)
          throw new Error('Error creating polygon: Polygon requires at least 3 points.');
        this.obj = JSXGen.elements.board.create('polygon', pts);
      };
    },
    /**
     * Graph prototype
     * @param {string} name       Function graph name
     * @param {string} definition Mathematical graph equation
     */
    Graph: function (name, definition) {
      this.name = name;
      this.definition = definition;

      this.generate = function () {
        var color = JSXGen.elements._colors[0] || 'blue';
        JSXGen.elements._colors.shift();
        var def = this.definition;
        this.obj = JSXGen.elements.board.create('functiongraph', [function (x) {
          return eval(def);
        }], {strokeColor: color});
      };
    }
  }
};

/**
 * Strip all parentheses and square brackets from string
 * @param  {string} data String to clean
 * @return {string}
 */
function stripBrackets(data) {
  return data.replace(/[\[\]\(\)]/g, '');
}