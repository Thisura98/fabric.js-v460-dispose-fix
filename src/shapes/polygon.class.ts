//@ts-nocheck

  var fabric = global.fabric || (global.fabric = {}),
      projectStrokeOnPoints = fabric.util.projectStrokeOnPoints;
  /**
   * Polygon class
   * @class fabric.Polygon
   * @extends fabric.Polyline
   * @see {@link fabric.Polygon#initialize} for constructor definition
   */
export class Polygon extends fabric.Polyline {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type = 'polygon'

    /**
     * @private
     */
    _projectStrokeOnPoints() {
      return projectStrokeOnPoints(this.points, this);
    }

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _render(ctx) {
      if (!this.commonRender(ctx)) {
        return;
      }
      ctx.closePath();
      this._renderPaintInOrder(ctx);
    }

  }

  /* _FROM_SVG_START_ */
  /**
   * List of attribute names to account for when parsing SVG element (used by `fabric.Polygon.fromElement`)
   * @static
   * @memberOf fabric.Polygon
   * @see: http://www.w3.org/TR/SVG/shapes.html#PolygonElement
   */
  fabric.Polygon.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat();

  /**
   * Returns {@link fabric.Polygon} instance from an SVG element
   * @static
   * @memberOf fabric.Polygon
   * @param {SVGElement} element Element to parse
   * @param {Function} callback callback function invoked after parsing
   * @param {Object} [options] Options object
   */
  fabric.Polygon.fromElement = fabric.Polyline.fromElementGenerator('Polygon');
  /* _FROM_SVG_END_ */

  /**
   * Returns fabric.Polygon instance from an object representation
   * @static
   * @memberOf fabric.Polygon
   * @param {Object} object Object to create an instance from
   * @returns {Promise<fabric.Polygon>}
   */
  fabric.Polygon.fromObject = function(object) {
    return fabric.Object._fromObject(fabric.Polygon, object, { extraParam: 'points' });
  };
