define([
    "../consts"
], function(consts) {
    'use strict';
    return function(editor, config) {
        var pn = editor.Panels;
        var cmdm = editor.Commands;
        pn.addButton("commands", [{
            id: 'new',
            className: 'fa fa-plus',
            command: function(editor, sender) {
                sender.set('active', 0);
                var newCmd = cmdm.get(consts.cmdNew);
                newCmd.run(editor);
            },
            attributes: { title: 'New (CTRL/CMD + I)' }
        }, {
            id: 'open',
            className: 'fa fa-folder-open-o',
            command: function(editor, sender) {
                sender.set('active', 0);
                var openCmd = cmdm.get(consts.cmdOpen);
                openCmd.run(editor);
            },
            attributes: { title: 'Open (CTRL/CMD + I)' }
        }, {
            id: 'import',
            className: 'fa fa-download',
            command: function(editor, sender) {
                sender.set('active', 0);
                var importCmd = cmdm.get(consts.cmdImport);
                importCmd.run(editor);
            },
            attributes: { title: 'Import (CTRL/CMD + I)' }
        }, {
            id: 'save',
            className: 'fa fa-save',
            command: function(editor, sender) {
                sender.set('active', 0);
                var saveCmd = cmdm.get(consts.cmdSave);
                saveCmd.run(editor);
            },
            attributes: { title: 'Save (CTRL/CMD + S)' }
        }, {
            id: 'example',
            className: 'fa fa-etsy',
            command: function(editor, sender) {
                sender.set('active', 0);
                var exampleCmd = cmdm.get(consts.cmdExample);
                exampleCmd.run(editor);
            },
            attributes: { title: 'Save (CTRL/CMD + S)' }
        }]);
    };
});