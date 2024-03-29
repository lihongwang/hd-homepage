define([
    "backbone",
    "./PropertyView",
    "../../domain_abstract/ui/InputNumber"
], function(Backbone, PropertyView, InputNumber) {
    return PropertyView.extend({

        initialize(options) {
            PropertyView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:unit', this.valueChanged);
        },

        /**
         * Returns value from inputs
         * @return {string}
         */
        getValueForTarget() {
            var model = this.model;
            return model.get('value') + model.get('unit');
        },

        renderInput() {
            if (!this.input) {
                var inputNumber = new InputNumber({
                    model: this.model,
                    ppfx: this.ppfx
                });
                this.input = inputNumber.render();
                this.$el.append(this.input.$el);
                this.$input = this.input.inputEl;
                this.$unit = this.input.unitEl;
            }
            this.setValue(this.componentValue);
        },

        renderTemplate() {},

        setValue(value) {
            this.input.setValue(value, {
                silent: 1
            });
        },

    });
});