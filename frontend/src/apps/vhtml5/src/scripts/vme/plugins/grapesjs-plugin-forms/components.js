define(['exports', 'module'], function (exports, module) {
  'use strict';

  module.exports = function (editor) {
    var opt = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var c = opt;
    var domc = editor.DomComponents;
    var defaultType = domc.getType('default');
    var textType = domc.getType('text');
    var defaultModel = defaultType.model;
    var defaultView = defaultType.view;
    var textModel = textType.model;
    var textView = textType.view;

    var stateNormal = 'Normal';
    var stateSuccess = 'Success';
    var stateError = 'Error';

    var idTrait = {
      name: 'id',
      label: c.labelTraitId
    };

    var forTrait = {
      name: 'for',
      label: c.labelTraitFor
    };

    var nameTrait = {
      name: 'name',
      label: c.labelTraitName
    };

    var placeholderTrait = {
      name: 'placeholder',
      label: c.labelTraitPlaceholder
    };

    var valueTrait = {
      name: 'value',
      label: c.labelTraitValue
    };

    var requiredTrait = {
      type: 'checkbox',
      name: 'required',
      label: c.labelTraitRequired
    };

    var checkedTrait = {
      label: c.labelTraitChecked,
      type: 'checkbox',
      name: 'checked',
      changeProp: 1
    };

    var preventDefaultClick = function preventDefaultClick() {
      return defaultType.view.extend({
        events: {
          'mousedown': 'handleClick'
        },

        handleClick: function handleClick(e) {
          e.preventDefault();
        }
      });
    };

    domc.addType('form', {
      model: defaultModel.extend({
        defaults: Object.assign({}, defaultModel.prototype.defaults, {
          droppable: ':not(form)',
          draggable: ':not(form)',
          traits: [{
            type: 'select',
            label: c.labelTraitMethod,
            name: 'method',
            options: [{ value: 'post', name: 'POST' }, { value: 'get', name: 'GET' }]
          }, {
            label: c.labelTraitAction,
            name: 'action'
          } /*,{
             type: 'select',
             label: c.labelTraitState,
             name: 'formState',
             changeProp: 1,
             options: [
               {value: '', name: c.labelStateNormal},
               {value: 'success', name: c.labelStateSuccess},
               {value: 'error', name: c.labelStateError},
             ]
            }*/]
        }),

        init: function init() {
          this.listenTo(this, 'change:formState', this.updateFormState);
        },

        updateFormState: function updateFormState() {
          var state = this.get('formState');
          switch (state) {
            case 'success':
              this.showState('success');
              break;
            case 'error':
              this.showState('error');
              break;
            default:
              this.showState('normal');
          }
        },

        showState: function showState(state) {
          var st = state || 'normal';
          var failVis, successVis;
          if (st == 'success') {
            failVis = 'none';
            successVis = 'block';
          } else if (st == 'error') {
            failVis = 'block';
            successVis = 'none';
          } else {
            failVis = 'none';
            successVis = 'none';
          }
          var successModel = this.getStateModel('success');
          var failModel = this.getStateModel('error');
          var successStyle = successModel.getStyle();
          var failStyle = failModel.getStyle();
          successStyle.display = successVis;
          failStyle.display = failVis;
          successModel.setStyle(successStyle);
          failModel.setStyle(failStyle);
        },

        getStateModel: function getStateModel(state) {
          var st = state || 'success';
          var stateName = 'form-state-' + st;
          var stateModel;
          var comps = this.get('components');
          for (var i = 0; i < comps.length; i++) {
            var model = comps.models[i];
            if (model.get('form-state-type') == st) {
              stateModel = model;
              break;
            }
          }
          if (!stateModel) {
            var contentStr = formMsgSuccess;
            if (st == 'error') {
              contentStr = formMsgError;
            }
            stateModel = comps.add({
              'form-state-type': st,
              type: 'text',
              removable: false,
              copyable: false,
              draggable: false,
              attributes: { 'data-form-state': st },
              content: contentStr
            });
          }
          return stateModel;
        }
      }, {
        isComponent: function isComponent(el) {
          if (el.tagName == 'FORM') {
            return { type: 'form' };
          }
        }
      }),

      view: defaultView.extend({
        events: {
          submit: function submit(e) {
            e.preventDefault();
          }
        }
      })
    });

    // INPUT
    domc.addType('input', {
      model: defaultModel.extend({
        defaults: Object.assign({}, defaultModel.prototype.defaults, {
          'custom-name': c.labelInputName,
          tagName: 'input',
          draggable: 'form, form *',
          droppable: false,
          traits: [nameTrait, placeholderTrait, {
            label: c.labelTraitType,
            type: 'select',
            name: 'type',
            options: [{ value: 'text', name: c.labelTypeText }, { value: 'email', name: c.labelTypeEmail }, { value: 'password', name: c.labelTypePassword }, { value: 'number', name: c.labelTypeNumber }]
          }, requiredTrait]
        })
      }, {
        isComponent: function isComponent(el) {
          if (el.tagName == 'INPUT') {
            return { type: 'input' };
          }
        }
      }),
      view: defaultView
    });

    var inputType = domc.getType('input');
    var inputModel = inputType.model;

    // TEXTAREA
    domc.addType('textarea', {
      model: inputType.model.extend({
        defaults: Object.assign({}, inputModel.prototype.defaults, {
          'custom-name': c.labelTextareaName,
          tagName: 'textarea',
          traits: [nameTrait, placeholderTrait, requiredTrait]
        })
      }, {
        isComponent: function isComponent(el) {
          if (el.tagName == 'TEXTAREA') {
            return { type: 'textarea' };
          }
        }
      }),
      view: defaultView
    });

    // SELECT
    domc.addType('select', {
      model: defaultModel.extend({
        defaults: Object.assign({}, inputModel.prototype.defaults, {
          'custom-name': c.labelSelectName,
          tagName: 'select',
          traits: [nameTrait, {
            label: c.labelTraitOptions,
            type: 'select-options'
          }, requiredTrait]
        })
      }, {
        isComponent: function isComponent(el) {
          if (el.tagName == 'SELECT') {
            return { type: 'select' };
          }
        }
      }),
      view: preventDefaultClick()
    });

    // CHECKBOX
    domc.addType('checkbox', {
      model: defaultModel.extend({
        defaults: Object.assign({}, inputModel.prototype.defaults, {
          'custom-name': c.labelCheckboxName,
          copyable: false,
          attributes: { type: 'checkbox' },
          traits: [idTrait, nameTrait, valueTrait, requiredTrait, checkedTrait]
        }),

        init: function init() {
          this.listenTo(this, 'change:checked', this.handleChecked);
        },

        handleChecked: function handleChecked() {
          var checked = this.get('checked');
          var attrs = this.get('attributes');
          var view = this.view;

          if (checked) {
            attrs.checked = 'checked';
          } else {
            delete attrs.checked;
          }

          if (view) {
            view.el.checked = checked;
          }

          this.set('attributes', Object.assign({}, attrs));
        }
      }, {
        isComponent: function isComponent(el) {
          if (el.tagName == 'INPUT' && el.type == 'checkbox') {
            return { type: 'checkbox' };
          }
        }
      }),
      view: defaultView.extend({
        events: {
          'click': 'handleClick'
        },

        handleClick: function handleClick(e) {
          e.preventDefault();
        }
      })
    });

    var checkType = domc.getType('checkbox');

    // RADIO
    domc.addType('radio', {
      model: checkType.model.extend({
        defaults: Object.assign({}, checkType.model.prototype.defaults, {
          'custom-name': c.labelRadioName,
          attributes: { type: 'radio' }
        })
      }, {
        isComponent: function isComponent(el) {
          if (el.tagName == 'INPUT' && el.type == 'radio') {
            return { type: 'radio' };
          }
        }
      }),
      view: checkType.view
    });

    domc.addType('button', {
      model: defaultModel.extend({
        defaults: Object.assign({}, inputModel.prototype.defaults, {
          'custom-name': c.labelButtonName,
          tagName: 'button',
          traits: [{
            type: 'content',
            label: 'Text'
          }, {
            label: c.labelTraitType,
            type: 'select',
            name: 'type',
            options: [{ value: 'submit', name: c.labelTypeSubmit }, { value: 'reset', name: c.labelTypeReset }, { value: 'button', name: c.labelTypeButton }]
          }]
        })
      }, {
        isComponent: function isComponent(el) {
          if (el.tagName == 'BUTTON') {
            return { type: 'button' };
          }
        }
      }),
      view: defaultView.extend({
        events: {
          'click': 'handleClick'
        },

        init: function init() {
          this.listenTo(this.model, 'change:content', this.updateContent);
        },

        updateContent: function updateContent() {
          this.el.innerHTML = this.model.get('content');
        },

        handleClick: function handleClick(e) {
          e.preventDefault();
        }
      })
    });

    // LABEL
    domc.addType('label', {
      model: textModel.extend({
        defaults: Object.assign({}, textModel.prototype.defaults, {
          'custom-name': c.labelNameLabel,
          tagName: 'label',
          traits: [forTrait]
        })
      }, {
        isComponent: function isComponent(el) {
          if (el.tagName == 'LABEL') {
            return { type: 'label' };
          }
        }
      }),
      view: textView
    });
  };
});