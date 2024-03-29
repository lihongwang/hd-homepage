define([
    "backbone"
], function(Backbone) {
    return Backbone.Model.extend({

        idAttribute: 'name',

        defaults: {
            name: '',

            // Width to set for the editor iframe
            width: '',

            // The width which will be used in media queries,
            // If empty the width will be used
            widthMedia: null,
        },

        initialize() {
            if (this.get('widthMedia') == null) {
                this.set('widthMedia', this.get('width'));
            }
        }

    });
});