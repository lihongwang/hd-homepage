define([
    "toastr",
    "skylarkjs",
    "scripts/vme/index",
    "text!scripts/routes/home/home.html"
], function(toastr, skylarkjs, vme, homeTpl) {
    var spa = skylarkjs.spa,
        $ = skylarkjs.query;
    return spa.RouteController.inherit({
        klassName: "HomeController",

        // preparing: function(e) {
        //     var deferred = new skylarkjs.langx.Deferred();
        //     require([
        //         "scripts/vme/plugins/grapesjs-lory-slider.min",
        //         "scripts/vme/plugins/grapesjs-preset-webpage.min"
        //     ], function() {
        //         deferred.resolve();
        //     });
        //     e.result = deferred.promise;
        // },

        rendering: function(e) {
            e.content = homeTpl;
        },

        rendered: function(e) {

            var host = 'http://artf.github.io/grapesjs/';
            var images = [
                host + 'img/grapesjs-logo.png',
                host + 'img/tmp-blocks.jpg',
                host + 'img/tmp-tgl-images.jpg',
                host + 'img/tmp-send-test.jpg',
                host + 'img/tmp-devices.jpg',
            ];

            // Set up GrapesJS editor with the Newsletter plugin
            var editor = vme.init({
                clearOnRender: true,
                height: '100%',
                storageManager: {
                    id: 'gjs-nl-',
                },
                assetManager: {
                    assets: images,
                    upload: 0,
                    uploadText: 'Uploading is not available in this demo',
                },
                container: '#gjs',
                fromElement: true,
                plugins: ['gjs-preset-newsletter', 'gjs-aviary', 'gjs-plugin-ckeditor'],
                pluginsOpts: {
                    'gjs-preset-newsletter': {
                        modalLabelImport: 'Paste all your code here below and click import',
                        modalLabelExport: 'Copy the code and use it wherever you want',
                        codeViewerTheme: 'material',
                        //defaultTemplate: templateImport,
                        importPlaceholder: '<table class="table"><tr><td class="cell">Hello world!</td></tr></table>',
                        cellStyle: {
                            'font-size': '12px',
                            'font-weight': 300,
                            'vertical-align': 'top',
                            color: 'rgb(111, 119, 125)',
                            margin: 0,
                            padding: 0,
                        }
                    },
                    'gjs-plugin-ckeditor': {
                        position: 'center',
                        options: {
                            startupFocus: true,
                            extraAllowedContent: '*(*);*{*}', // Allows any class and any inline style
                            allowedContent: true, // Disable auto-formatting, class removing, etc.
                            enterMode: CKEDITOR.ENTER_BR,
                            extraPlugins: 'sharedspace,justify,colorbutton,panelbutton,font',
                            toolbar: [
                                { name: 'styles', items: ['Font', 'FontSize'] },
                                ['Bold', 'Italic', 'Underline', 'Strike'],
                                { name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
                                { name: 'links', items: ['Link', 'Unlink'] },
                                { name: 'colors', items: ['TextColor', 'BGColor'] },
                            ],
                        }
                    }
                }
            });


            // Let's add in this demo the possibility to test our newsletters
            var mdlClass = 'gjs-mdl-dialog-sm';
            var pnm = editor.Panels;
            var cmdm = editor.Commands;
            var md = editor.Modal;
            /*
            var testContainer = document.getElementById("test-form");
            var contentEl = testContainer.querySelector('input[name=body]');
            cmdm.add('send-test', {
              run(editor, sender) {
                sender.set('active', 0);
                var modalContent = md.getContentEl();
                var mdlDialog = document.querySelector('.gjs-mdl-dialog');
                var cmdGetCode = cmdm.get('gjs-get-inlined-html');
                contentEl.value = cmdGetCode && cmdGetCode.run(editor);
                mdlDialog.className += ' ' + mdlClass;
                testContainer.style.display = 'block';
                md.setTitle('Test your Newsletter');
                md.setContent('');
                md.setContent(testContainer);
                md.open();
                md.getModel().once('change:open', function() {
                  mdlDialog.className = mdlDialog.className.replace(mdlClass, '');
                  //clean status
                })
              }
            });
            pnm.addButton('options', {
              id: 'send-test',
              className: 'fa fa-paper-plane',
              command: 'send-test',
              attributes: {
                'title': 'Test Newsletter',
                'data-tooltip-pos': 'bottom',
              },
            });
      
            var statusFormElC = document.querySelector('.form-status');
            var statusFormEl = document.querySelector('.form-status i');
            var ajaxTest = ajaxable(testContainer).
              onStart(function(){
                statusFormEl.className = 'fa fa-refresh anim-spin';
                statusFormElC.style.opacity = '1';
                statusFormElC.className = 'form-status';
              })
              .onResponse(function(res){
                if (res.data) {
                  statusFormElC.style.opacity = '0';
                  statusFormEl.removeAttribute('data-tooltip');
                  md.close();
                } else if(res.errors || res.errors == '') {
                  var err = res.errors || 'Server error';
                  statusFormEl.className = 'fa fa-exclamation-circle';
                  statusFormEl.setAttribute('data-tooltip', err);
                  statusFormElC.className = 'form-status text-danger';
                }
              });
            */

            // Add info command
            var infoContainer = document.getElementById("info-panel");
            cmdm.add('open-info', {
                run(editor, sender) {
                    sender.set('active', 0);
                    var mdlDialog = document.querySelector('.gjs-mdl-dialog');
                    mdlDialog.className += ' ' + mdlClass;
                    infoContainer.style.display = 'block';
                    md.setTitle('About this demo');
                    md.setContent('');
                    md.setContent(infoContainer);
                    md.open();
                    md.getModel().once('change:open', function() {
                        mdlDialog.className = mdlDialog.className.replace(mdlClass, '');
                    })
                }
            });
            pnm.addButton('options', [{
                id: 'undo',
                className: 'fa fa-undo',
                attributes: { title: 'Undo' },
                command: function() { editor.runCommand('core:undo') }
            }, {
                id: 'redo',
                className: 'fa fa-repeat',
                attributes: { title: 'Redo' },
                command: function() { editor.runCommand('core:redo') }
            }, {
                id: 'clear-all',
                className: 'fa fa-trash icon-blank',
                attributes: { title: 'Clear canvas' },
                command: {
                    run: function(editor, sender) {
                        sender && sender.set('active', false);
                        if (confirm('Are you sure to clean the canvas?')) {
                            editor.DomComponents.clear();
                            setTimeout(function() {
                                localStorage.clear()
                            }, 0)
                        }
                    }
                }
            }, {
                id: 'view-info',
                className: 'fa fa-question-circle',
                command: 'open-info',
                attributes: {
                    'title': 'About',
                    'data-tooltip-pos': 'bottom',
                },
            }]);

            // Simple warn notifier
            var origWarn = console.warn;
            toastr.options = {
                closeButton: true,
                preventDuplicates: true,
                showDuration: 250,
                hideDuration: 150
            };
            console.warn = function(msg) {
                toastr.warning(msg);
                origWarn(msg);
            };

            // Beautify tooltips
            var titles = document.querySelectorAll('*[title]');
            for (var i = 0; i < titles.length; i++) {
                var el = titles[i];
                var title = el.getAttribute('title');
                title = title ? title.trim() : '';
                if (!title)
                    break;
                el.setAttribute('data-tooltip', title);
                el.setAttribute('title', '');
            }


            // Do stuff on load
            editor.on('load', function() {
                var $ = grapesjs.$;

                // Show logo with the version
                var logoCont = document.querySelector('.gjs-logo-cont');
                document.querySelector('.gjs-logo-version').innerHTML = 'v' + grapesjs.version;
                var logoPanel = document.querySelector('#gjs-pn-commands');
                logoPanel.appendChild(logoCont);

                // Move Ad
                $('#gjs').append($('.ad-cont'));
            });
        },
        entered: function(e) {},
        exited: function(e) {}
    });
});