/** @type {object} Different error messages for different languages */
var errorMessages = {
  notNumeric: 'The value must be numeric.',
  missingPoint: 'You are trying to create a polyong with an undefined point.',
  notEnoughPoints: 'You need at least three points to create a polygon.',
  stringEmpty: 'You must input something!'
};

// default fallback, can be changed if defined within script tag in html file before including this
var genURL = genURL || 'http://mustpro.eu/moodle/aaimg/ajsx/mat/generators/polygongenerator.html';

/** @type {object} Store errors in here */
var errors = {};
var points = [], polygons = [], curves = [];

var pointCounter = 1, polygonCounter = 1, curveCounter = 1, pointInputFieldCounter = 1,
    polygonInputFieldCounter = 1, curveInputFieldCounter = 1;

var sanitize = function (str) {
  return str.replace(/[\s\.\-\_\(\)\[\]\{\}]/g, '').replace(/ /g, '').toLowerCase();
}

/**
 * Hide or show element if given array is empty
 */
var refreshEmptyMessage = function (list, element) {
  if (list.length > 0) {
    element.hide();
  } else {
    element.show();
  }
};

var displayErrors = function () {
  // grid errors
  var grid = false;
  if (errors["gridControlsMaxX"]) {
    $('#max-x').addClass('error');
    grid = true;
  } else {
    $('#max-x').removeClass('error');
  }
  if (errors["gridControlsMinX"]) {
    $('#min-x').addClass('error');
    grid = true;
  } else {
    $('#min-x').removeClass('error');
  }
  if (errors["gridControlsMaxY"]) {
    $('#max-y').addClass('error');
    grid = true;
  } else {
    $('#max-y').removeClass('error');
  }
  if (errors["gridControlsMinY"]) {
    $('#min-y').addClass('error');
    grid = true;
  } else {
    $('#min-y').removeClass('error');
  }
  if (grid) {
    $('#grid-error-msg').text(errors["gridControlsMaxX"] || errors["gridControlsMinX"]
      || errors["gridControlsMaxY"] || errors["gridControlsMinY"]);
  } else {
    $('#grid-error-msg').text('');
  }
  // point errors
  var point = false;
  if (errors["pointErrorX"]) {
    $('#point-x-value').addClass('error');
    point = true;
  } else {
    $('#point-x-value').removeClass('error');
  }
  if (errors["pointErrorY"]) {
    $('#point-y-value').addClass('error');
    point = true;
  } else {
    $('#point-y-value').removeClass('error');
  }
  if (point) {
    $('#points-error-msg').text(errors["pointErrorX"] || errors["pointErrorY"]);
    delete errors["pointErrorX"];
    delete errors["pointErrorY"];
  } else {
    $('#points-error-msg').text('');
  }
  // polygons
  if (errors["polygonError"]) {
    $('#polygon-points').addClass('error');
    $('#polygons-error-msg').text(errors["polygonError"]);
    delete errors["polygonError"];
  } else {
    $('#polygon-points').removeClass('error');
    $('#polygons-error-msg').text('');
  }
  // curves
  if (errors["curveError"]) {
    $('#function-points').addClass('error');
    $('#function-error-msg').text(errors["curveError"]);
    delete errors["curveError"];
  } else {
    $('#function-points').removeClass('error');
    $('#function-error-msg').text('');
  }
}

/**
 * Generate and refresh url to show
 */
var refreshUrl = function () {
  delete errors["gridControlsMaxX"];
  delete errors["gridControlsMinX"];
  delete errors["gridControlsMaxY"];
  delete errors["gridControlsMinY"];
  var params = [];
  // grid params
  if (!$('#cbx-show-grid').is(':checked')) {
    params.push('grid=0');
  }
  if (!$('#cbx-show-coords').is(':checked')) {
    params.push('showTCoords=0');
  }
  // grid size
  var temp = $('#max-x').val();
  if (temp) {
    if (!$.isNumeric(temp)) {
      errors["gridControlsMaxX"] = errorMessages.notNumeric;
    } else {
      params.push('maxx=' + temp);
    }
  }
  temp = $('#min-x').val();
  if (temp) {
    if (!$.isNumeric(temp)) {
      errors["gridControlsMinX"] = errorMessages.notNumeric;
    } else {
      params.push('minx=' + temp);
    }
  }
  temp = $('#max-y').val();
  if (temp) {
    if (!$.isNumeric(temp)) {
      errors["gridControlsMaxY"] = errorMessages.notNumeric;
    } else {
      params.push('maxy=' + temp);
    }
  }
  temp = $('#min-y').val();
  if (temp) {
    if (!$.isNumeric(temp)) {
      errors["gridControlsMinY"] = errorMessages.notNumeric;
    } else {
      params.push('miny=' + temp);
    }
  }
  // points / polygons
  [].concat(points).concat(polygons).forEach(function (el) {
    params.push(el.convertToUrl());
  });
  // curves
  curves.forEach(function (el) {
    params.push(el.convertToUrl());
  });
  var nurl = genURL + ((params.length > 0) ? '?' + params.join('&') : '');
  $('#generated-url').val(nurl);
  $('#iframe-display').attr('src', nurl);
  displayErrors();
}

var deleteElement = function (e) {
  var matches = e.target.id.match(/(point|polygon|function)-delete-(\d+)$/);
  $('#' + e.target.id).parent().parent().remove();
  switch (matches[1]) {
    case 'point':
      for (var i = 0; i < points.length; i++) {
        if (points[i].name == 't' + matches[2]) {
          points.splice(i, 1);
          break;
        }
      }
      pointCounter--; pointInputFieldCounter--;
      refreshEmptyMessage(points, $('#points-msg'));
      refreshUrl();
      break;
    case 'polygon':
      for (var i = 0; i < polygons.length; i++) {
        if (polygons[i].name == 'p' + matches[2]) {
          polygons.splice(i, 1);
          break;
        }
      }
      polygonCounter--; polygonInputFieldCounter--;
      refreshEmptyMessage(polygons, $('#polygons-msg'));
      refreshUrl();
      break;
    case 'function':
      for (var i = 0; i < curves.length; i++) {
        if (curves[i].name == 'f' + matches[2]) {
          curves.splice(i, 1);
          break;
        }
      }
      curveCounter--; curveInputFieldCounter--;
      refreshUrl();
      break;
  }
}

/**
 * Create point object
 * @param {numeric} x
 * @param {numeric} y
 * @return {Point}
 */
var Point = function (x, y) {
  var valid = true;
  if (!$.isNumeric(x)) {
    errors["pointErrorX"] = errorMessages.notNumeric;
    valid = false;
  }
  if (!$.isNumeric(y)) {
    errors["pointErrorY"] = errorMessages.notNumeric;
    valid = false;
  }
  if (valid) {
    this.name = 't' + pointCounter++;
    this.x = x;
    this.y = y;
    points.push(this);
  } else {
    throw new Error('Point was not instantiated.');
  }
  return this;
};
Point.prototype.convertToUrl = function () {
  return this.name + '=[' + this.x + ',' + this.y + ']';
};
Point.prototype.toString = function () {
  return this.name;
}
Point.prototype.createDomElement = function () {
  var element = $('<div/>', {
    'id': 'point-' + pointInputFieldCounter
  });
  var elementDesc = $('<div/>', {
    'class': 'small-8 columns',
    'text': this.name + ' (' + this.x + ', ' + this.y + ')'
  });
  var btnDelete = $('<button/>', {
    'id': 'point-delete-' + pointInputFieldCounter++,
    'text': 'Delete',
    'click': deleteElement
  });
  var elementDelete = $('<div/>', {
    'class': 'small-4 columns'
  }).append(btnDelete);
  element.append(elementDesc).append(elementDelete).appendTo($('#point-list'));
};

/**
 * Create polygon object
 * @param {string} strPoints Points that make up the polygon
 * @return {Polygon}
 */
var Polygon = function (strPoints) {
  var polyPoints = sanitize(strPoints).split(",");
  if (polyPoints.length < 3) {
    errors["polygonError"] = errorMessages.notEnoughPoints;
    throw new Error("Polygon was not instantiated: not enough points!");
  }
  this.points = new Array(polyPoints.length);
  for (var i = 0; i < polyPoints.length; i++) {
    var found = false;
    for (var j = 0; j < points.length; j++) {
      if (polyPoints[i] == points[j].name) {
        found = true;
        this.points[i] = points[j];
        break;
      }
    }
    if (!found) {
      errors["polygonError"] = errorMessages.missingPoint;
      throw new Error("Polygon was not instantiated: missing point!");
    }
  }
  this.name = 'p' + polygonCounter++;
  polygons.push(this);
  return this;
};
Polygon.prototype.convertToUrl = function () {
  return this.name + '=[' + this.points.join(',') + ']';
};
Polygon.prototype.toString = function () {
  return this.name;
};
Polygon.prototype.createDomElement = function () {
  var element = $('<div/>', {
    'id': 'polygon-' + polygonInputFieldCounter
  });
  var elementDesc = $('<div/>', {
    'class': 'small-8 columns',
    'text': this.name + ' (' + this.points.join(', ') + ')'
  });
  var btnDelete = $('<button/>', {
    'id': 'polygon-delete-' + polygonInputFieldCounter++,
    'text': 'Delete',
    'click': deleteElement
  });
  var elementDelete = $('<div/>', {
    'class': 'small-4 columns'
  }).append(btnDelete);
  element.append(elementDesc).append(elementDelete).appendTo($('#polygon-list'));
};

/**
 * Create curve/function object
 * @param {string} definition Curve definition
 * @return {Curve}
 */
var Curve = function (definition) {
  definition = definition.replace(/ /g, '');
  var valid = true;
  if (definition.length < 1) {
    errors["curveError"] = errorMessages.stringEmpty;
    valid = false;
  }
  if (valid) {
    this.name = 'f' + curveCounter++;
    this.definition = definition;
    curves.push(this);
  } else {
    throw new Error('Empty definition given');
  }
  return this;
}
Curve.prototype.convertToUrl = function () {
  return this.name + "=" + this.definition;
}
Curve.prototype.toString = function () {
  return this.name;
}
Curve.prototype.createDomElement = function () {
  var element = $('<div/>', {
    'id': 'function-' + curveInputFieldCounter
  });
  var elementDesc = $('<div/>', {
    'class': 'small-8 columns',
    'text': this.name + ' = ' + this.definition
  });
  var btnDelete = $('<button/>', {
    'id': 'function-delete-' + curveInputFieldCounter++,
    'text': 'Delete',
    'click': deleteElement
  });
  var elementDelete = $('<div/>', {
    'class': 'small-4 columns'
  }).append(btnDelete);
  element.append(elementDesc).append(elementDelete).appendTo($('#function-list'));
};

/**
 * Link function to appropriate triggers
 */
$('#add-point-trigger').click(function () {
  var pointXVal = $('#point-x-value'), pointYVal = $('#point-y-value');
  try {
    new Point(pointXVal.val(), pointYVal.val()).createDomElement();
    pointXVal.val(''); pointYVal.val('');
    refreshEmptyMessage(points, $('#points-msg'));
  } catch (e) { }
  refreshUrl();;
});
$('#add-polygon-trigger').click(function () {
  var polyPoints = $('#polygon-points');
  try {
    new Polygon(polyPoints.val()).createDomElement();
    polyPoints.val('');
    refreshEmptyMessage(polygons, $('#polygon-msg'));
  } catch (e) { }
  refreshUrl();
});
$('#add-function-trigger').click(function () {
  var definition = $('#function-definition');
  try {
    new Curve(definition.val()).createDomElement();
    definition.val('');
    refreshEmptyMessage(polygons, $('#function-msg'));
  } catch (e) { }
  refreshUrl();
});
$('[type=checkbox]').change(refreshUrl);
$('#max-x, #max-y, #min-x, #min-y').focusout(refreshUrl);
/**
 * Default state
 */
$(document).ready(function () {
  $('#iframe-display').attr('src', genURL);
  refreshUrl();
});