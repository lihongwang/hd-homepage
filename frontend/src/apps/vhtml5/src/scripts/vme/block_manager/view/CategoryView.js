define([
    "backbone"
], function(Backbone) {
    return Backbone.View.extend({

        template: _.template(`
  <div class="<%= pfx %>title">
    <i class="<%= pfx %>caret-icon"></i>
    <%= label %>
  </div>
  <div class="<%= pfx %>blocks-c"></div>
  `),

        //events: {},

        initialize(o = {}, config = {}) {
            this.config = config;
            var pfx = this.config.pStylePrefix || '';
            this.pfx = pfx;
            this.caretR = 'fa fa-caret-right';
            this.caretD = 'fa fa-caret-down';
            this.iconClass = `${pfx}caret-icon`;
            this.activeClass = `${pfx}open`;
            this.className = `${pfx}block-category`;

            this.events = {};

            this.events[`click .${pfx}title`] = 'toggle';
            this.listenTo(this.model, 'change:open', this.updateVisibility);
            //this.delegateEvents();
        },

        updateVisibility() {
            if (this.model.get('open'))
                this.open();
            else
                this.close();
        },

        open() {
            this.el.className = `${this.className} ${this.activeClass}`;
            this.getIconEl().className = `${this.iconClass} ${this.caretD}`;
            this.getBlocksEl().style.display = '';
        },

        close() {
            this.el.className = this.className;
            this.getIconEl().className = `${this.iconClass} ${this.caretR}`;
            this.getBlocksEl().style.display = 'none';
        },

        toggle() {
            var model = this.model;
            model.set('open', !model.get('open'));
        },

        getIconEl() {
            if (!this.iconEl) {
                this.iconEl = this.el.querySelector('.' + this.iconClass);
            }

            return this.iconEl;
        },

        getBlocksEl() {
            if (!this.blocksEl) {
                this.blocksEl = this.el.querySelector('.' + this.pfx + 'blocks-c');
            }

            return this.blocksEl;
        },

        append(el) {
            this.getBlocksEl().appendChild(el);
        },

        render() {
            this.el.innerHTML = this.template({
                pfx: this.pfx,
                label: this.model.get('label'),
            });
            this.el.className = this.className;
            this.updateVisibility();
            return this;
        },
    });
});