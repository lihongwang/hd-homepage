define([
    "backbone"
], function(Backbone, ) {
    return Backbone.View.extend({

        tagName: 'span',

        initialize(o) {
            _.bindAll(this, 'startTimer', 'stopTimer', 'showButtons', 'hideButtons', 'closeOnKeyPress', 'onDrop', 'initSorter', 'stopDrag');
            var cls = this.model.get('className');
            this.config = o.config || {};
            this.em = this.config.em || {};
            this.pfx = this.config.stylePrefix || '';
            this.ppfx = this.config.pStylePrefix || '';
            this.id = this.pfx + this.model.get('id');
            this.activeCls = this.pfx + 'active';
            this.btnsVisCls = this.pfx + 'visible';
            this.parentM = o.parentM || null;
            this.className = this.pfx + 'btn' + (cls ? ' ' + cls : '');
            this.listenTo(this.model, 'change:active updateActive', this.updateActive);
            this.listenTo(this.model, 'checkActive', this.checkActive);
            this.listenTo(this.model, 'change:bntsVis', this.updateBtnsVis);
            this.listenTo(this.model, 'change:attributes', this.updateAttributes);
            this.listenTo(this.model, 'change:className', this.updateClassName);

            if (this.model.get('buttons').length) {
                this.$el.on('mousedown', this.startTimer);
                this.$el.append($('<div>', {
                    class: this.pfx + 'arrow-rd'
                }));
            }

            if (this.em && this.em.get)
                this.commands = this.em.get('Commands');

            this.events = {};

            if (this.model.get('dragDrop')) {
                this.events.mousedown = 'initDrag';
                this.em.on('loaded', this.initSorter);
            } else
                this.events.click = 'clicked';

            //this.delegateEvents();
        },

        initSorter() {
            if (this.em.Canvas) {
                var canvas = this.em.Canvas;
                this.canvasEl = canvas.getBody();
                this.sorter = new this.em.Utils.Sorter({
                    container: this.canvasEl,
                    placer: canvas.getPlacerEl(),
                    containerSel: '*',
                    itemSel: '*',
                    pfx: this.ppfx,
                    onMove: this.onDrag,
                    onEndMove: this.onDrop,
                    document: canvas.getFrameEl().contentDocument,
                    direction: 'a',
                    wmargin: 1,
                    nested: 1,
                });
                var offDim = canvas.getOffset();
                this.sorter.offTop = offDim.top;
                this.sorter.offLeft = offDim.left;
            }
        },

        /**
         * Init dragging element
         * @private
         */
        initDrag() {
            this.model.collection.deactivateAll(this.model.get('context'));
            this.sorter.startSort(this.el);
            this.sorter.setDropContent(this.model.get('options').content);
            this.canvasEl.style.cursor = 'grabbing';
            $(document).on('mouseup', this.stopDrag);
        },

        /**
         * Stop dragging
         * @private
         */
        stopDrag() {
            $(document).off('mouseup', this.stopDrag);
            this.sorter.endMove();
        },

        /**
         * During drag method
         * @private
         */
        onDrag(e) {},

        /**
         * During drag method
         * @private
         */
        onDrop(e) {
            this.canvasEl.style.cursor = 'default';
        },

        /**
         * Updates class name of the button
         *
         * @return   void
         * */
        updateClassName() {
            var cls = this.model.get('className');
            this.$el.attr('class', this.pfx + 'btn' + (cls ? ' ' + cls : ''));
        },

        /**
         * Updates attributes of the button
         *
         * @return   void
         * */
        updateAttributes() {
            this.$el.attr(this.model.get("attributes"));
        },

        /**
         * Updates visibility of children buttons
         *
         * @return  void
         * */
        updateBtnsVis() {
            if (!this.$buttons)
                return;

            if (this.model.get('bntsVis'))
                this.$buttons.addClass(this.btnsVisCls);
            else
                this.$buttons.removeClass(this.btnsVisCls);
        },

        /**
         * Start timer for showing children buttons
         *
         * @return  void
         * */
        startTimer() {
            this.timeout = setTimeout(this.showButtons, this.config.delayBtnsShow);
            $(document).on('mouseup', this.stopTimer);
        },

        /**
         * Stop timer for showing children buttons
         *
         * @return  void
         * */
        stopTimer() {
            $(document).off('mouseup', this.stopTimer);
            if (this.timeout)
                clearTimeout(this.timeout);
        },

        /**
         * Show children buttons
         *
         * @return   void
         * */
        showButtons() {
            clearTimeout(this.timeout);
            this.model.set('bntsVis', true);
            $(document).on('mousedown', this.hideButtons);
            $(document).on('keypress', this.closeOnKeyPress);
        },

        /**
         * Hide children buttons
         *
         * @return   void
         * */
        hideButtons(e) {
            if (e) {
                $(e.target).trigger('click');
            }
            this.model.set('bntsVis', false);
            $(document).off('mousedown', this.hideButtons);
            $(document).off('keypress', this.closeOnKeyPress);
        },

        /**
         * Close buttons on ESC key press
         * @param   {Object}  e  Event
         *
         * @return   void
         * */
        closeOnKeyPress(e) {
            var key = e.which || e.keyCode;
            if (key == 27)
                this.hideButtons();
        },

        /**
         * Update active status of the button
         *
         * @return   void
         * */
        updateActive() {
            var command = null;
            var editor = this.em && this.em.get ? this.em.get('Editor') : null;
            var commandName = this.model.get('command');

            if (this.commands && typeof commandName === 'string') {
                command = this.commands.get(commandName);
            } else if (commandName !== null && typeof commandName === 'object') {
                command = commandName;
            } else if (typeof commandName === 'function') {
                command = {
                    run: commandName
                };
            }

            if (this.model.get('active')) {

                this.model.collection.deactivateAll(this.model.get('context'));
                this.model.set('active', true, {
                    silent: true
                }).trigger('checkActive');

                if (this.parentM)
                    this.parentM.set('active', true, {
                        silent: true
                    }).trigger('checkActive');

                if (command && command.run) {
                    command.run(editor, this.model, this.model.get('options'));
                    editor.trigger('run:' + commandName);
                }
            } else {
                this.$el.removeClass(this.activeCls);

                this.model.collection.deactivateAll(this.model.get('context'));

                if (this.parentM)
                    this.parentM.set('active', false, {
                        silent: true
                    }).trigger('checkActive');

                if (command && command.stop) {
                    command.stop(editor, this.model, this.model.get('options'));
                    editor.trigger('stop:' + commandName);
                }
            }
        },

        /**
         * Update active style status
         *
         * @return   void
         * */
        checkActive() {
            if (this.model.get('active'))
                this.$el.addClass(this.activeCls);
            else
                this.$el.removeClass(this.activeCls);
        },

        /**
         * Triggered when button is clicked
         * @param  {Object}  e  Event
         *
         * @return   void
         * */
        clicked(e) {
            if (this.model.get('bntsVis'))
                return;

            if (this.parentM)
                this.swapParent();
            var active = this.model.get('active');
            this.model.set('active', !active);

            // If the stop is requested
            var command = this.em.get('Commands').get('select-comp');

            if (active) {
                if (this.model.get('runDefaultCommand'))
                    this.em.runDefault();
            } else {
                if (this.model.get('stopDefaultCommand'))
                    this.em.stopDefault();
            }
        },

        /**
         * Updates parent model swapping properties
         *
         * @return  void
         * */
        swapParent() {
            this.parentM.collection.deactivateAll(this.model.get('context'));
            this.parentM.set('attributes', this.model.get('attributes'));
            this.parentM.set('options', this.model.get('options'));
            this.parentM.set('command', this.model.get('command'));
            this.parentM.set('className', this.model.get('className'));
            this.parentM.set('active', true, {
                silent: true
            }).trigger('checkActive');
        },

        render() {
            this.updateAttributes();
            this.$el.attr('class', this.className);

            if (this.model.get('buttons').length) {
                var btnsView = require('./ButtonsView'); //Avoid Circular Dependencies
                var view = new btnsView({
                    collection: this.model.get('buttons'),
                    config: this.config,
                    parentM: this.model
                });
                this.$buttons = view.render().$el;
                this.$buttons.append($('<div>', {
                    class: this.pfx + 'arrow-l'
                }));
                this.$el.append(this.$buttons); //childNodes avoids wrapping 'div'
            }

            return this;
        },

    });
});