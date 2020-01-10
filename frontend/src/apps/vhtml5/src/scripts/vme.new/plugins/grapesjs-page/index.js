define([
    "skylarkjs",
    "jquery",
    "server",
    "commHelpers/Partial",
    "commHelpers/List",
    "skylarkBs",
    '../../grapesjs/index',
    './commands/index',
    './panels/index'
], function(skylarkjs, $, server, partial, List, skylarkBs, _grapesjs, commands, panels) {
    'use strict';
    var PLUGIN_NAME = 'gjs-page';

    return _grapesjs.plugins.add(PLUGIN_NAME, function(editor, opts) {
        var config = opts || {};
        var em = editor.getModel();
        var editorImage = undefined;
        var cmdm = editor.Commands;
        var defaults = {
            // Modal import title
            modalImportTitle: 'Import',

            // Modal import button text
            modalImportButton: 'Import',

            // Import description inside import modal
            modalImportLabel: '',

            // Default content to setup on import model open.
            // Could also be a function with a dynamic content return (must be a string)
            // eg. modalImportContent: editor => editor.getHtml(),
            modalImportContent: '',
        };
        for (var _name in defaults) {
            if (!(_name in config)) config[_name] = defaults[_name];
        }
        // Add command
        commands(editor, config);
        // Add btn
        panels(editor, config);
    });
});