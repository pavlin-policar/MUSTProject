
# Helper functions
stripBrackets = (str) -> str.replace /[\[\]\(\)]/g, ''

mathFunctionDictionary = (str) ->
  # Math constants ; Are case sensitive
  str = str.replace ///
    (?:Math\.)?(E|PI|SQRT2|SQRT1_2|LN2|LN10|LOG2E|LOG10E)///g,
    "Math.$1"
  # Math methods ; Case insensitive
  str = str.replace ///(?:Math\.)?(abs|acos|acosh|asin|asinh|atan|atanh|atan2|
      cbrt|ceil|clz32|cos|cosh|exp|expm1|floor|fround|hypot|imul|log|log1p|
      log10|log2|max|min|pow|random|round|sign|sin|sinh|sqrt|tan|tanh|trunc
    )///gi, "Math.$1"


# Class declarations
class Component
  constructor: (@name, @definition) ->
    @obj = null
  generate: -> throw new Error "Not implemented!"

class Point extends Component
  generate: ->
    @obj = JSXGen.elements.board.create 'point',
      [this.definition[0], this.definition[1]],
      showInfobox: JSXGen.localOptions.point.showInfobox

class Polygon extends Component
  generate: ->
    points = []
    for defObj in @definition
      points.push defObj.obj
    if points.length < 3
      throw new Error "Error generating polygon. Requires at least 3 points!"
    @obj = JSXGen.elements.board.create 'polygon', points

class Graph extends Component
  generate: ->
    color = JSXGen.elements.color[0] ? 'blue'
    JSXGen.elements.color.shift()
    @obj = JSXGen.elements.board.create 'functiongraph',
      ((x) -> eval(@def)),
      strokeColor: color

class Parameter
  constructor: (@key, @value) ->


# JSXGen
window.JSXGen or=

  boardOptions:
    showCopyright: false
    showNavigation: true
    axis: true
    grid: true
    boundingBox: [-6, 6, 6, -6]
    zoom: false
    pan: false
    keepaspectratio: false

  localOptions:
    point:
      showInfoBox: true

  elements:
    board: null
    colors: ['blue', 'red', 'green', 'orange', 'black', 'grey']
    Point: Point
    Polygon: Polygon
    Graph: Graph

  getParams: ->
    index = document.URL.indexOf '?'
    paramString = document.URL.substring index + 1, document.URL.length
    paramString = decodeURI paramString

    params = []

    if index isnt -1
      pairs = paramString.split '&'
      for param in pairs
        nameVal = param.split '='
        params.push new Parameter nameVal[0], nameVal[1]
    params

  initBoard: (domElement, params) ->
    this.applyParams params
    this.elements.board = JXG.JSXGraph.initBoard domElement, this.boardOptions
    this.elements.board

  applyParams: (params) ->
    for param in params
      switch param.key
        when 'minx'
          if param.value < this.boardOptions.boundingBox[2]
            this.boardOptions.boundingBox[0] = param.value
        when 'maxy'
          if param.value > this.boardOptions.boundingBox[3]
            this.boardOptions.boundingBox[1] = param.value
        when 'maxx'
          if param.value > this.boardOptions.boundingBox[0]
            this.boardOptions.boundingBox[2] = param.value
        when 'miny'
          if param.value < this.boardOptions.boundingBox[1]
            this.boardOptions.boundingBox[3] = param.value
        when 'grid'
          if param.value is 'f' or param.value is '0'
            this.boardOptions.grid = false
        when 'axis'
          if param.value is 'f' or param.value is '0'
            this.boardOptions.axis = false
        when 'colors'
          data = stripBrackets param.value
          data = data.split ','
          for color in data
            this.elements.colors.unshift element
        when 'showTCoords'
          if param.value is 'f' or param.value is '0'
            this.localOptions.point.showInfobox = false
    true