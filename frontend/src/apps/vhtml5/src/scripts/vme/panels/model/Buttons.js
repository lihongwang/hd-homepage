define([
    "backbone",
    "./Button"
], function(Backbone, Button) {
    return Backbone.Collection.extend({

        model: Button,

        /**
         * Deactivate all buttons, except one passed
         * @param  {Object}  except  Model to ignore
         * @param  {Boolean}  r     Recursive flag
         *
         * @return  void
         * */
        deactivateAllExceptOne(except, r) {
            this.forEach((model, index) => {
                if (model !== except) {
                    model.set('active', false);
                    if (r && model.get('buttons').length)
                        model.get('buttons').deactivateAllExceptOne(except, r);
                }
            });
        },

        /**
         * Deactivate all buttons
         * @param  {String}  ctx Context string
         *
         * @return  void
         * */
        deactivateAll(ctx) {
            var context = ctx || '';
            this.forEach((model, index) => {
                if (model.get('context') == context) {
                    model.set('active', false);
                    if (model.get('buttons').length)
                        model.get('buttons').deactivateAll(context);
                }
            });
        },

    });
});