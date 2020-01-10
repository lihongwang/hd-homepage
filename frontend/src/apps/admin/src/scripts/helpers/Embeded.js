define(["jquery", "skylarkjs"], function($, skylarkjs) {
    var langx = skylarkjs.langx;
    var Embeded = langx.Evented.inherit({
        klass: "Embeded",
        init: function(opts) {
            var _this = this;

            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this.options = Utils.deepExtend({}, API.Defaults, options);
            this.id = this.options.id || Utils.generateID('bed');
            this.liveTimeout = -1;
            this.isLive = false;
            this.heightSetted = false;
            this.resizer = null;

            this.loading = null;
            this.wrapper = null;
            this.container = null;
            this.liveButton = null;

            this.has = {
                html: false,
                css: false,
                js: false
            };

            Object.keys(this.options.files).forEach(function(type) {
                if (_this.options.files.hasOwnProperty(type)) {
                    for (var i = 0; i < _this.options.files[type].length; i++) {
                        var ext = Utils.getExtension(_this.options.files[type][i]);
                        if (Utils.inArray(ext, API.FileTypes.html)) {
                            _this.has.html = true;
                            continue;
                        }

                        if (Utils.inArray(ext, API.FileTypes.js)) {
                            _this.has.js = true;
                            continue;
                        }

                        if (Utils.inArray(ext, API.FileTypes.css)) {
                            _this.has.css = true;
                        }
                    }
                }
            });

            return this;
        },
        show: function() {
            API.build(this);

            this.container.appendChild(this.wrapper);
            this.loading = this.container.querySelector('.minibed_loading');

            this.bindEvents();
            this.initEditor();
            return this;
        },
        bindEvents: function() {
            var _this2 = this;

            var self = this;
            var tabs = this.wrapper.querySelectorAll('.minibed_tab');

            tabs.forEach(function(tab) {
                Utils.addListener(tab, 'click', function(e) {
                    Utils.stopPropagation(e);

                    if (!Utils.hasClass(tab, 'minibed_active')) {
                        Utils.removeClass(self.wrapper.querySelector('.minibed_active'), 'minibed_active');
                        Utils.addClass(tab, 'minibed_active');
                    }

                    Utils.removeClass(self.wrapper.querySelector('.minibed_active_tab'), 'minibed_active_tab');
                    Utils.removeClass(self.wrapper.querySelector('.minibed_tab_content[data-lang="' + tab.getAttribute('data-lang') + '"]'), 'minibed_selected_content');
                    Utils.addClass(self.wrapper.querySelector('.minibed_tab_content[data-file="' + tab.querySelector('.minibed_tabs_current').getAttribute('data-current') + '"]'), 'minibed_active_tab minibed_selected_content');

                    self.initEditor();
                });
            });

            this.liveButton = this.wrapper.querySelector('.minibed_tab_result');
            Utils.addListener(this.liveButton, 'click', function() {
                _this2.liveToggle();
            });

            Utils.addListener(this.liveButton.querySelector('label'), 'click', function(e) {
                e.preventDefault();
                return false;
            });

            var dropdownItems = this.wrapper.querySelectorAll('.minibed_dropdown_item');

            dropdownItems.forEach(function(item) {
                Utils.addListener(item, 'click', function(e) {
                    Utils.stopPropagation(e);
                    if (!Utils.hasClass(item, 'minibed_selected_tab')) {
                        Utils.removeClass(item.parentNode.querySelector('.minibed_selected_tab'), 'minibed_selected_tab');
                        Utils.addClass(item, 'minibed_selected_tab');
                        var curr = item.parentNode.parentNode.querySelector('.minibed_tabs_current');
                        curr.setAttribute('data-current', item.getAttribute('data-file'));
                        curr.click();
                    }
                });
            });
        },

        liveToggle: function() {
            var _this3 = this;

            if (Utils.hasClass(this.liveButton, 'mb_live_active')) {
                Utils.removeClass(this.liveButton, 'mb_live_active');
                Utils.removeClass(this.tabContents, 'minibed_live');
                this.liveButton.querySelector('#minibed_checkbox-result').removeAttribute('checked');
                this.isLive = false;
            } else {
                Utils.addClass(this.liveButton, 'mb_live_active');
                Utils.addClass(this.tabContents, 'minibed_live');
                this.liveButton.querySelector('#minibed_checkbox-result').setAttribute('checked', 'checked');
                this.isLive = true;
                this.run();
            }
            setTimeout(function() {
                _this3.activeEditor.refresh();
            }, 10);
        },

        importCSS: function() {
            var styleContent = this.container.querySelector('.minibed_selected_content[data-lang="css"]');
            return styleContent ? '<style type="text/css">' + styleContent.innerHTML + '</style>' : '';
        },
        importJS: function() {
            var jsContent = this.container.querySelector('.minibed_selected_content[data-lang="javascript"]');
            return jsContent ? '<script type="text/javascript">' + jsContent.value + '</script>' : '';
        },
        importJSError: function() {
            return '<script type="text/javascript">window.onerror = function(msg, source, lineno, colno, error) {\n      console.log(msg, source, lineno, colno, error)\n      parent.document.querySelector(\'.minibed_bed#' + this.id + ' .minibed_result_frame\').style.borderBottomColor = \'#F44336\';\n    }</script>';
        },
        importBaseCSS: function() {
            if (this.options.settings.css.base !== 'none') {
                return '<link rel="stylesheet prefetch" href="' + API.Includes[this.options.settings.css.base] + '"/>';
            }
            return '';
        },
        importExternalCSS: function() {
            var styles = '';

            if (this.options.external.css.length > 0) {
                this.options.external.css.forEach(function(url) {
                    styles += '<link rel="stylesheet prefetch" href="' + url + '"/>';
                });
            }
            return styles;
        },
        importExternalJS: function() {
            var styles = '';

            if (this.options.external.js.length > 0) {
                this.options.external.js.forEach(function(url) {
                    styles += '<script src="' + url + '" type="text/javascript"></script>\n\n\n';
                });
            }

            return styles;
        },

        run: function() {
            if (this.isLive) {
                Utils.remove(this.container.querySelector('iframe.minibed_result_frame'));

                var resultFrame = new Utils.CreateDOM('iframe.minibed_result_frame').setAttr('src', 'about:blank').setAttr('name', this.id);
                this.tabContents.appendChild(resultFrame.el);

                var frameTemplate = '<!DOCTYPE html>\n        <html lang="en">\n        <head>\n          <meta charset="UTF-8">\n          <title>minibed <3</title>\n          ' + this.importBaseCSS() + '\n          ' + this.importExternalCSS() + '\n          ' + this.importCSS() + '\n        </head>\n        <body>\n          ' + this.importHTML() + '\n          ' + this.importJSError() + '\n          ' + this.importExternalJS() + '\n          ' + this.importJS() + '\n        </body>\n        </html>';

                var iframe = window.frames[this.id].document;
                iframe.open();
                iframe.write(frameTemplate);
                iframe.close();
            }
        },

        initCodeMirror: function() {
            var self = this;

            var mode = this.activeContent.getAttribute('data-lang');

            this.activeEditor = CodeMirror.fromTextArea(this.activeContent, {
                mode: mode,
                tabSize: this.options.settings.tabSize,
                lineNumbers: this.options.settings.lineNumbers,
                lineWrapping: this.options.settings.lineWrapping,
                readOnly: this.options.settings.readOnly,
                styleActiveLine: true,
                matchBrackets: true,
                autoCloseBrackets: true,
                autoCloseTags: true,
                theme: this.options.editorTheme,
                scrollbarStyle: 'simple'
            });

            this.activeEditor.on('change', function() {
                self.activeContent.innerHTML = self.activeEditor.getValue();
                self.activeContent.value = self.activeEditor.getValue();
                clearTimeout(self.liveTimeout);
                self.liveTimeout = setTimeout(function() {
                    self.run();
                }, 400);
            });

            this.tabContents = this.wrapper.querySelector('.minibed_tab_contents');

            if (!self.heightSetted) {
                Utils.css(this.tabContents, {
                    height: this.tabContents.offsetHeight + 'px'
                });
            }

            var scroller = this.wrapper.querySelector('.CodeMirror-scroll');

            if (this.options.settings.scrollLock && !Utils.isTouchDevice()) {
                Utils.addListener(scroller, 'mousewheel DOMMouseScroll', function(e) {
                    var delta = e.wheelDelta || e.originalEvent && e.originalEvent.wheelDelta || -e.detail;
                    var bottomOverflow = scroller.scrollTop + scroller.getBoundingClientRect().height - scroller.scrollHeight >= 0;
                    var topOverflow = scroller.scrollTop <= 0;
                    if (delta < 0 && bottomOverflow || delta > 0 && topOverflow) {
                        e.preventDefault();
                    }
                });
            }

            Utils.addClass(this.loading, 'hide');

            this.resizer = new Utils.MBResizable(this.wrapper.querySelector('.CodeMirror'), function() {
                self.activeEditor.refresh();
                Utils.css(self.tabContents, {
                    height: self.wrapper.querySelector('.CodeMirror').offsetHeight + 'px'
                });
            });

            this.run();
        },
        initEditor: function() {
            var self = this;
            Utils.removeClass(this.loading, 'hide');

            if (this.activeEditor) {
                this.activeEditor.toTextArea();
            }

            this.activeContent = this.container.querySelector('.minibed_active_tab');

            if (this.activeContent.getAttribute('data-loaded') === 'yes') {
                this.initCodeMirror();
                return;
            }

            var allFiles = [];
            if (this.has.js) {
                this.options.files.js.forEach(function(file) {
                    allFiles.push(file);
                });
            }
            if (this.has.css) {
                this.options.files.css.forEach(function(file) {
                    allFiles.push(file);
                });
            }
            if (this.has.html) {
                this.options.files.html.forEach(function(file) {
                    allFiles.push(file);
                });
            }

            this.responseCount = 0;

            allFiles.forEach(function(file) {
                Utils.Request(file, function(data) {
                    self.responseCount++;
                    var textarea = self.wrapper.querySelector('.minibed_tab_content[data-file="' + file + '"]');
                    textarea.innerHTML = data;
                    textarea.setAttribute('data-loaded', 'yes');
                });
            });

            this.responseCheck = window.setInterval(function() {
                if (self.responseCount === allFiles.length) {
                    window.clearInterval(self.responseCheck);
                    self.initCodeMirror();
                    self.liveToggle();
                }
            }, 100);
        },
        overrideDefaults: function() {
            API.Defaults = Utils.deepExtend({}, API.Defaults, obj);
            return this;
        },
        version: function() {
            return VERSION;
        }
    });
})