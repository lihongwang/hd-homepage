define(['exports', 'module'], function(exports, module) {
    'use strict';
    return function(editor, config) {
        return {
            run: function run(editor) {
                editor.setComponents("<div style='width:100%;height:100%'>add content in here!</div>");
            }
        };
    };
});