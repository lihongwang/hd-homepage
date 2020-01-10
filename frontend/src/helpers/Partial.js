define([
    "skylark-jquery",
    "skylarkjs",
    "text!./_partials.hbs",
    "handlebars"
], function($, skylarkjs, partialsTpl, handlebars) {
    var langx = skylarkjs.langx;
    var partials = {};
    var __selector = $(langx.trim(partialsTpl));
    var _registryPartial = function(name, selector) {
        selector = selector || __selector;
        selector.find("#" + name).each(function(index, partial) {
            handlebars.registerPartial(name, langx.trim($(partial).html()).replace(/\{\{&gt;/g, "{{>"));
            partials[name] = true;
        });
    }
    handlebars.registerHelper('eachData', function(context, options) {
        var fn = options.fn,
            inverse = options.inverse,
            ctx;
        var ret = "";

        if (context && context.length > 0) {
            for (var i = 0, j = context.length; i < j; i++) {
                ctx = Object.create(context[i]);
                ctx.index = i;
                ret = ret + fn(ctx);
            }
        } else {
            ret = inverse(this);
        }
        return ret;
    });

    /**
     * @param ary {Array}
     * @param max {Number} The max number of items to display from the array
     * @param [options.skip] {Number=0} Optional. Number of items to skip in the array
     */
    handlebars.registerHelper('each_upto', function(ary, max, options) {
        if (!ary || ary.length == 0)
            return options.inverse(this);

        var result = [],
            skip = (options.hash ? (options.hash.skip ? options.hash.skip : 0) : 0),
            i = skip;

        max += skip;

        for (; i < max && i < ary.length; ++i) {
            result.push(options.fn(ary[i], { data: { itemIndex: i } }));
        }

        return result.join('');
    });

    handlebars.registerHelper('rowData', function(ary, max, options) {
        max = max || 2;

        if (!ary || ary.length == 0)
            return options.inverse(this);
        var result = [],
            len = ary.length;
        var rowNum = 12 / len;
        if (rowNum < max) rowNum = max;
        for (var i = 0; i < len; i++) {
            result.push(options.fn(ary[i], { data: { rowNum: rowNum } }));
        }
        return result.join('');
    });


    handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);

        return {
            "+": lvalue + rvalue
        }[operator];
    });
    handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {

        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '!==':
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });

    var obj = {
        get: function(name, selector) {
            if (!partials[name]) _registryPartial(name, selector);
        },
        slide: function(banners) {
            obj.get("slide-component-partial");
            var tpl = handlebars.compile("{{> slide-component-partial}}");
            return $(tpl({
                banners: banners
            }));
        }
    };
    obj.get("repeater-tpl-partial");
    obj.get("datepicker-tpl-partial");
    obj.get("checkbox-tpl-partial");
    obj.get("wizard-tpl-partial");
    return obj;
});