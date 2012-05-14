/**
 * YUI3 Draggable Background Widget
 *
 * Created by Evan Culver <e@eculver.io>
 *
 * A widget that will use a specified image and dimensions to
 * produce a draggable, window-like view of an image.
 *
 * Example usage:
 *
 * YUI.use('widget-draggable-bg', function(Y) {
 *     var widget = new Y.Widget.DraggableBackground({
 *         boundingBox: '#foo'
 *         imageUrl: 'http://someimagepath.com/image.png',
 *         viewWidth: 400,
 *         viewHeight: 400
 *     }).render();
 * });
 *
 */
YUI.add('widget-draggable-bg', function(Y) {

    // Keep these around for convenience.
    var L = Y.Lang;

    /**
     * DraggableBackground constructor
     *
     * @extends Widget
     * @constructor
     * @param {object} config
     */
    function DraggableBackground(config) {
        DraggableBackground.superclass.constructor.apply(this, arguments);
    }

    /**
     *  YUI Widget Meta (see http://yhoo.it/4raYhI)
     */
    DraggableBackground.NS = 'widget';
    DraggableBackground.NAME = 'draggable-bg';
    DraggableBackground.ATTRS = {
        /**
         *  @attribute imageUrl
         *  @description URL of the background image.
         */
        imageUrl: {
            value: '',
            validator: L.isValue
        },

        /**
         *  @attribute viewWidth
         *  @description The width of `contentBox` element that the background image is
         *               applied to.
         */
        viewWidth: {
            value: 400,
            validator: L.isNumber
        },

        /**
         *  @attribute viewHeight
         *  @description The height of `contentBox` element that the background image is
         *               applied to.
         */
        viewHeight: {
            value: 400,
            validator: L.isNumber
        },

        /**
         *  @attribute lastPosition
         *  @description The last x and y position offsets for the background image.
         */
        lastPosition: {
            value: [0,0],
            readOnly: true,
            validator: L.isArray
        },

        /**
         *  @attribute isDragging
         *  @description Denotes that a drag is in progress.
         */
        isDragging: {
            value: false,
            readOnly: true,
            validator: L.isBoolean
        },

        /**
         *  @attribute image
         *  @description An `Image` object reference of the background image.
         *               Use this to obtain image width and height and then to
         *               prevent the user from positioning the image outside of
         *               its bounds.
         */
        image: {
            value: null,
            readOnly: true,
            validator: function (val) {
                return val instanceof Image;
            }
        }
    };

    /**
     *  DraggableBackground extends Widget
     */
    Y.extend(DraggableBackground, Y.Widget, {

        initializer: function(config) {
            Y.log(this.get('contentBox'));
            Y.log(this.get('imageUrl'));
            Y.log(this.get('viewWidth'));
            Y.log(this.get('viewHeight'));

            // setup our internal image
            var image = new Image();
            image.src = this.get('imageUrl');
            this._set('image', image);
        },

        destructor: function() {
            // detach all events here
            Y.detach('mousedown', this._onMouseDown);
            Y.detach('mousemove', this._onMouseMove);
            Y.detach('mouseup', this._onMouseUp);
            Y.detach('mouseout', this._onMouseOut);
        },

        renderUI: function() {
            var node = Y.one(this.get('contentBox'));

            // set the background of the `node` to `imageUrl` and make sure other repeat/position
            // styles are correctly initialized.
            node.setStyle('backgroundImage', ['url(', this.get('imageUrl'), ')'].join(''));
            node.setStyle('backgroundRepeat', 'no-repeat');
            node.setStyle('backgroundPositionX', '0');
            node.setStyle('backgroundPositionY', '0');

            // set the cursor to move to indicate dragging
            node.setStyle('cursor', 'move');

            // set the dimensions of the element
            node.setStyle('width', this.get('viewWidth'));
            node.setStyle('height', this.get('viewHeight'));
        },

        bindUI: function() {
            // ATTR Change events
            this.after('viewWidthChange', this._afterViewWidthChange);
            this.after('viewHeightChange', this._afterViewHeightChange);

            // delegate mouse events over `node`
            var node = Y.one(this.get('contentBox'));
            node.on('mousedown', this._onMouseDown, this);
            node.on('mousemove', this._onMouseMove, this);
            node.on('mouseup', this._onMouseUp, this);
            node.on('mouseout', this._onMouseOut, this);

            // enable touch support
            node.on('touchstart', this._onMouseDown, this);
            node.on('touchmove', this._onMouseMove, this);
            node.on('touchend', this._onMouseUp, this);
            node.on('touchcancel', this._onMouseOut, this);
        },

        /**
         * Turns dragging on and set current position so that the image doesn't jump
         * around when a new drag is instantiated.
         *
         * @method _onMouseDown
         * @param e {EventFacade} Event for the mouse down.
         * @private
         */
        _onMouseDown: function(e) {
            e.preventDefault();

            // reset last position to where the user just clicked
            var currentPosition = [e.pageX, e.pageY];
            this._set('lastPosition', currentPosition);

            // start the dragging
            this._set('isDragging', true);
        },

        /**
         * Performs a calculation to determine how much to adjust the backround image position
         * then calls the adjustment method with those deltas.
         *
         * @method _onMouseMove
         * @param e {EventFacade} Event for the mouse down.
         * @private
         */
        _onMouseMove: function(e) {
            e.preventDefault();

            if(this.get('isDragging')) {
                var lastPosition = this.get('lastPosition'),
                    currentPosition = [e.pageX, e.pageY],
                    diffx = lastPosition[0] - currentPosition[0],
                    diffy = lastPosition[1] - currentPosition[1];

                this._adjustImagePosition(diffx, diffy);
                this._set('lastPosition', currentPosition);
            }
        },

        /**
         * Turns dragging off.
         *
         * @method _onMouseUp
         * @param e {EventFacade} Event for the mouse down.
         * @private
         */
        _onMouseUp: function(e) {
            e.preventDefault();
            this._set('isDragging', false);
        },

        /**
         * Also turns dragging off.
         *
         * @method _onMouseOut
         * @param e {EventFacade} Event for the mouse out.
         * @private
         */
        _onMouseOut: function(e) {
            e.preventDefault();
            this._set('isDragging', false);
        },

        /**
         * Called after the `viewWidth` ATTR has changed to update the UI.
         *
         * @method _afterViewWidthChange
         * @param e {EventFacade} Event for the mouse down.
         * @private
         */
        _afterViewWidthChange: function(e) {
            this._uiSetViewWidth(this.get('viewWidth'));
        },

        /**
         * Called after the `viewHeight` ATTR has changed to update the UI.
         *
         * @method _afterViewHeightChange
         * @param e {EventFacade} Event for the mouse down.
         * @private
         */
        _afterViewHeightChange: function(e) {
            this._uiSetViewHeight(this.get('viewHeight'));
        },

        /**
         * Propagates the `viewWidth` ATTR to the UI.
         *
         * @method _uiSetViewWidth
         * @param e {int} new width in pixels.
         * @private
         */
        _uiSetViewWidth: function(val) {
            Y.one(this.get('contentBox')).setStyle('width', val);
        },

        /**
         * Propagates the `viewHeight` ATTR to the UI.
         *
         * @method _uiSetViewHeight
         * @param e {int} new height in pixels.
         * @private
         */
        _uiSetViewHeight: function(val) {
            Y.one(this.get('contentBox')).setStyle('height', val);
        },

        /**
         * Applies the background image position adjustment.
         *
         * @method _adjustImagePosition
         * @param diffx {int} background-position-x delta.
         * @param diffy {int} background-position-y delta.
         * @private
         */
        _adjustImagePosition: function(diffX, diffY) {
            var node = Y.one(this.get('contentBox')),
                image = this.get('image'),

                // parse out current position elements
                xy = node.getStyle('backgroundPosition').replace(/%/g, '').replace('px', '').split(' '),

                // individual position components
                currX = parseInt(xy[0]),
                currY = parseInt(xy[1]),

                // calculate new position
                newX = currX - diffX,
                newY = currY - diffY;

            Y.log('new position: ' + newX + 'px ' + newY + 'px');

            // make sure not to scale past image boundaries before adjusting
            if(!(newX <= 0 && newX >= -(image.width - this.get('viewWidth')))) {
                newX = currX;
            }
            if(!(newY <= 0 && newY >= -(image.height - this.get('viewHeight')))) {
                newY = currY;
            }

            node.setStyle('backgroundPosition', newX + 'px ' + newY + 'px');
        }
    });

    // Hang it off of Y.Widget
    Y.namespace('Widget').DraggableBackground = DraggableBackground;

}, '0.0.1', {
    requires: [
        'node',
        'widget',
        'event-touch'
    ]
});
