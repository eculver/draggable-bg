===========================
Draggable Background Widget
===========================

This widget simply creates a window-like view for an image, similar to the way Google Maps work. Currently, there is just support for YUI3 in the form of a widget, but jQuery plugin will be coming shortly.

---
YUI
---

Basic Usage
-----------

Simply include the module on the page::

    <script src="draggable-bg.js"></script>

Instantiate and render the widget::

    YUI.use('widget-draggable-bg', function(Y) {
        var widget = new Y.Widget.DraggableBackground({
            boundingBox: '#foo'
            imageUrl: 'http://someimagepath.com/image.png',
            viewWidth: 400,
            viewHeight: 400
        }).render();

Options
-------

    * ``boundingBox`` - The window element. Can be either a selector or ``Y.Node`` instance.

    * ``imageUrl`` - URL of the background image. Can be URL or relative path to an image. This is what gets stuffed in to the ``url()`` of the ``background`` CSS property.

    * ``viewWidth`` - (optional) The width, in pixels, of the viewing window. This is applied to the ``contentBox`` attribute if set.

    * ``viewHeight`` - (optional) The height, in pixels, of the viewing window. This is applied to the ``contentBox`` attribute if set.

------
jQuery
------

**plugin coming soon**

Basic Usage
-----------

Options
-------

