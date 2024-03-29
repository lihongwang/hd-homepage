define([
    "backbone",
    "./Category"
], function(Backbone, Category) {
    return Backbone.Model.extend({
        defaults: {
            label: '',
            content: '',
            category: '',
            attributes: {},
        },

        initialize(opts = {}) {
            var category = this.get('category');

            if (category) {
                if (typeof category == 'string') {
                    var catObj = new Category({
                        id: category,
                        label: category,
                    });
                }
            }
        },

    });
});