define([
    "server",
    "toastr"
], function(server, toastr) {
    'use strict';
    return function(editor, config) {
        return {
            run: function run(editor) {
                editor.store();
            }
        };
    };
})