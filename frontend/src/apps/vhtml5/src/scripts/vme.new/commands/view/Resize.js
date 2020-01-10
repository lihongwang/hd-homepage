define(['exports', 'module'], function(exports, module) {
    'use strict';

    module.exports = {
        run: function run(editor, sender, opts) {
            var opt = opts || {};
            var el = opt.el || '';
            var canvas = editor.Canvas;
            var canvasResizer = this.canvasResizer;
            var options = opt.options || {};
            var canvasView = canvas.getCanvasView();
            options.ratioDefault = 1;
            options.appendTo = canvas.getResizerEl();
            options.prefix = editor.getConfig().stylePrefix;
            options.posFetcher = canvasView.getElementPos.bind(canvasView);
            options.mousePosFetcher = canvas.getMouseRelativePos;

            // Create the resizer for the canvas if not yet created
            if (!canvasResizer || opt.forceNew) {
                this.canvasResizer = editor.Utils.Resizer.init(options);
                canvasResizer = this.canvasResizer;
            }

            canvasResizer.setOptions(options);
            canvasResizer.focus(el);
            return canvasResizer;
        },

        stop: function stop() {
            var resizer = this.canvasResizer;
            resizer && resizer.blur();
        }
    };
});