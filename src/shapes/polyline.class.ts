//@ts-nocheck

import { cacheProperties, SHARED_ATTRIBUTES } from '../constants';
import {
  max, min, projectStrokeOnPoints, toFixed
} from '../util';
import { parseAttributes, parsePointsAttribute } from "../parser/_parser";
import { FabricObject } from './object.class';

/**
 * Returns Polyline/Polygon instance from an SVG element
 * @static
 * @memberOf Polyline
 * @param {SVGElement} element Element to parser
 * @param {Function} callback callback function invoked after parsing
 * @param {Object} [options] Options object
 */
export function fromElementGenerator(klass) {
  return function (element, callback, options = {}) {
    if (!element) {
      return callback(null);
    }
    var points = parsePointsAttribute(element.getAttribute('points')),
      parsedAttributes = parseAttributes(element, klass.ATTRIBUTE_NAMES);
    callback(new klass(points, { ...parsedAttributes, ...options, fromSVG: true }));
  };
};


/**
 * Polyline class
 * @class Polyline
 * @extends FabricObject
 */
export class Polyline extends FabricObject {

  /**
   * Type of an object
   * @type String
   * @default
   */
  type = 'polyline'

  /**
   * Points array
   * @type Array
   * @default
   */
  points = null

  /**
   * WARNING: Feature in progress
   * Calculate the exact bounding box taking in account strokeWidth on acute angles
   * this will be turned to true by default on fabric 6.0
   * maybe will be left in as an optimization since calculations may be slow
   * @deprecated
   * @type Boolean
   * @default false
   */
  exactBoundingBox = false

  cacheProperties = cacheProperties.concat('points')

  /**
   * Constructor
   * @param {Array} points Array of points (where each point is an object with x and y)
   * @param {Object} [options] Options object
   * @return {Polyline} thisArg
   * @example
   * var poly = new Polyline([
   *     { x: 10, y: 10 },
   *     { x: 50, y: 30 },
   *     { x: 40, y: 70 },
   *     { x: 60, y: 50 },
   *     { x: 100, y: 150 },
   *     { x: 40, y: 100 }
   *   ], {
   *   stroke: 'red',
   *   left: 100,
   *   top: 100
   * });
   */
  constructor(points = [], options = {}) {
    super(options);
    this.points = points;
    this._setPositionDimensions(options);
  }

  /**
   * @private
   */
  _projectStrokeOnPoints() {
    return projectStrokeOnPoints(this.points, this, true);
  }

  _setPositionDimensions(options) {
    options || (options = {});
    var calcDim = this._calcDimensions(options), correctLeftTop,
      correctSize = this.exactBoundingBox ? this.strokeWidth : 0;
    this.width = calcDim.width - correctSize;
    this.height = calcDim.height - correctSize;
    if (!options.fromSVG) {
      correctLeftTop = this.translateToGivenOrigin(
        {
          // this looks bad, but is one way to keep it optional for now.
          x: calcDim.left - this.strokeWidth / 2 + correctSize / 2,
          y: calcDim.top - this.strokeWidth / 2 + correctSize / 2
        },
        'left',
        'top',
        this.originX,
        this.originY
      );
    }
    if (typeof options.left === 'undefined') {
      this.left = options.fromSVG ? calcDim.left : correctLeftTop.x;
    }
    if (typeof options.top === 'undefined') {
      this.top = options.fromSVG ? calcDim.top : correctLeftTop.y;
    }
    this.pathOffset = {
      x: calcDim.left + this.width / 2 + correctSize / 2,
      y: calcDim.top + this.height / 2 + correctSize / 2
    };
  }

  /**
   * Calculate the polygon min and max point from points array,
   * returning an object with left, top, width, height to measure the
   * polygon size
   * @return {Object} object.left X coordinate of the polygon leftmost point
   * @return {Object} object.top Y coordinate of the polygon topmost point
   * @return {Object} object.width distance between X coordinates of the polygon leftmost and rightmost point
   * @return {Object} object.height distance between Y coordinates of the polygon topmost and bottommost point
   * @private
   */
  _calcDimensions() {

    var points = this.exactBoundingBox ? this._projectStrokeOnPoints() : this.points,
      minX = min(points, 'x') || 0,
      minY = min(points, 'y') || 0,
      maxX = max(points, 'x') || 0,
      maxY = max(points, 'y') || 0,
      width = (maxX - minX),
      height = (maxY - minY);

    return {
      left: minX,
      top: minY,
      width: width,
      height: height,
    };
  }

  /**
   * Returns object representation of an instance
   * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
   * @return {Object} Object representation of an instance
   */
  toObject(propertiesToInclude) {
    return {
      ...super.toObject(propertiesToInclude),
      points: this.points.concat()
    };
  }

  /* _TO_SVG_START_ */
  /**
   * Returns svg representation of an instance
   * @return {Array} an array of strings with the specific svg representation
   * of the instance
   */
  _toSVG() {
    var points = [], diffX = this.pathOffset.x, diffY = this.pathOffset.y,
      NUM_FRACTION_DIGITS = FabricObject.NUM_FRACTION_DIGITS;

    for (var i = 0, len = this.points.length; i < len; i++) {
      points.push(
        toFixed(this.points[i].x - diffX, NUM_FRACTION_DIGITS), ',',
        toFixed(this.points[i].y - diffY, NUM_FRACTION_DIGITS), ' '
      );
    }
    return [
      '<' + this.type + ' ', 'COMMON_PARTS',
      'points="', points.join(''),
      '" />\n'
    ];
  }
  /* _TO_SVG_END_ */


  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  commonRender(ctx) {
    var point, len = this.points.length,
      x = this.pathOffset.x,
      y = this.pathOffset.y;

    if (!len || isNaN(this.points[len - 1].y)) {
      // do not draw if no points or odd points
      // NaN comes from parseFloat of a empty string in parser
      return false;
    }
    ctx.beginPath();
    ctx.moveTo(this.points[0].x - x, this.points[0].y - y);
    for (var i = 0; i < len; i++) {
      point = this.points[i];
      ctx.lineTo(point.x - x, point.y - y);
    }
    return true;
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  _render(ctx) {
    if (!this.commonRender(ctx)) {
      return;
    }
    this._renderPaintInOrder(ctx);
  }

  /**
   * Returns complexity of an instance
   * @return {Number} complexity of this instance
   */
  complexity() {
    return this.points.length;
  }

  /* _FROM_SVG_START_ */
  /**
   * List of attribute names to account for when parsing SVG element (used by {@link Polyline.fromElement})
   * @static
   * @memberOf Polyline
   * @see: http://www.w3.org/TR/SVG/shapes.html#PolylineElement
   */
  static ATTRIBUTE_NAMES = SHARED_ATTRIBUTES.concat();

  static fromElement = fromElementGenerator(Polyline);

  /* _FROM_SVG_END_ */

  /**
   * Returns Polyline instance from an object representation
   * @static
   * @memberOf Polyline
   * @param {Object} object Object to create an instance from
   * @returns {Promise<Polyline>}
   */
  static fromObject(object) {
    return FabricObject._fromObject(Polyline, object, { extraParam: 'points' });
  };

}

