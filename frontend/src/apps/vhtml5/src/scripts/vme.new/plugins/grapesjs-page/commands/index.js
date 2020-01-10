define([
    './Open',
    './New',
    './Save',
    './Import',
    './Example',
    '../consts'
], function(_open, _new, _save, _import, _example, _consts) {
    'use strict';
    return function(editor, config) {
        var cm = editor.Commands;
        cm.add(_consts.cmdImport, _import(editor, config));
        cm.add(_consts.cmdNew, _new(editor, config));
        cm.add(_consts.cmdSave, _save(editor, config));
        cm.add(_consts.cmdOpen, _open(editor, config));
        cm.add(_consts.cmdExample, _example(editor, config));
    };
});