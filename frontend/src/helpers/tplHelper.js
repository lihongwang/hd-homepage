define([
    "skylarkjs",
    "./Partial",
    "lodash",
    "jquery",
    "handlebars",
    "text!./_tplPartials.hbs"
], function(skylarkjs, partial, _, $, hbs, template) {
    var langx = skylarkjs.langx,
        __selector = $(langx.trim(template));
    var bannerData = [{
        "imgDiv": "http://o7tu2j8yo.bkt.clouddn.com/1.jpg",
        "name2Title": "Responsive layout",
        "name2Desc": "响应式布局移动互联网解决方案",
        "content": "响应式布局可以为不同终端的用户提供更加舒适的界面和更好的用户体验，而且随着目前大屏幕移动设备的普及，用 大势所趋 来形容也不为过。随着越来越多的设计师采用这个技术，我们不仅看到很多的创新，还看到了一些成形的模式。"
    }];
    var serviceData = [{
        "imgUrl": "assets/images/nimg55_1.png",
        "name": "<div>Design</div>设计",
        "name2": "<div>Design</div>网站设计",
        "dd1": "网站设计",
        "dd2": "网页设计",
        "dd3": "自适应设计",
        "dd4": "响应式设计",
        "dd5": "移动端设计",
        "dd6": "手机端设计",
        "dd7": "APP设计",
        "dd8": "UI设计",
        "dd9": "微信设计",
        "dd10": "嵌入式设计",
        "dd11": "LOGO设计",
        "dd12": "平面设计",
        "lionName": "EDUCATION",
        "lionBg": "/assets/images/9fa741cdf451935c7019e92469a41328.png",
        "lionTitle": "WEBSITE",
        "lionDesc": "学校教育培训机构网站建设解决方案"
    }];
    var modelData = [{
        "pcImg": "http://d1.faiusr.com/2/AAEIABACGAAg-q6RzwUoxKvwpwcwhgQ4nQU.jpg",
        "pcHref": "http://fkgg15.faisco.cn/",
        "pcTitle": "使用的主题编号：T4001",
        "mobiImg": "http://d1.faiusr.com/2/AAEIABACGAAg5Iqj0QUo1MexrgcwyAE45AI.jpg",
        "mobiHref": "http://fkgg22.faisco.cn/",
        "mobiTitle": "使用的主题编号：T4001",
        "mobiAlt": "餐饮酒店手机网页模板"
    }];
    var helperData = [{
        "dateMD": "03-20",
        "dateY": "2017",
        "title": "怎么创建一个网站？怎么建立自己网站？【详细步骤】",
        "intro": "【快速学会自己做网站】怎么做网站？如何制作自己的网站？其实一点都不难，什么都不懂？没关系！只需要几个步骤，网站就成了！"
    }];

    function getFormTpl(name) {
        var formName = name + "-form-partial";
        partial.get(formName, __selector);
        var formTpl = hbs.compile("{{> " + formName + "}}");
        return formTpl;
    };

    function getContentTpl(name) {
        var contentName = name + "-partial";
        partial.get(contentName, __selector);
        var tpl = hbs.compile("{{> " + contentName + "}}");
        return tpl;
    }
    return {
        data: {
            homeBanner: {
                name: "homeBanner",
                cnName: "Banner",
                itemCount: 3,
                category: "home",
                show: function(tpl, data, main, container) {
                    var self = this;
                    var _s = $(tpl({
                        imgDiv: bannerData.imgDiv,
                        name: bannerData.name,
                        name2: bannerData.name2,
                        content: bannerData.content,
                    }));
                    return _s.appendTo(container);
                }
            },
            homeService: {
                name: "homeService",
                cnName: "我们的服务",
                itemCount: 4,
                category: "home",
                show: function(tpl, data, main, container) {
                    var serviceData = data[0];
                    var self = this;
                    var _s = $(tpl({
                        serviceData: serviceData
                    }));
                    return _s.appendTo(container);
                }
            },
            homeModel: {
                name: "homeModel",
                cnName: "Model",
                itemCount: 4,
                category: "home",
                show: function(tpl, data, main, container) {
                    var modelData = data[0];
                    var _s = $(tpl({
                        pcImg: modelData.pcImg,
                        pcHref: modelData.pcHref,
                        pcTitle: modelData.pcTitle,
                        mobiImg: modelData.mobiHref,
                        mobiHref: modelData.mobiHref,
                        mobiTitle: modelData.mobiTitle,
                        mobiAlt: modelData.mobiAlt
                    }));
                    return _s.appendTo(container);
                }
            },
            homeHelper: {
                name: "homeHelper",
                cnName: "Helper",
                itemCount: 6,
                category: "home",
                show: function(tpl, data, main, container) {
                    var self = this;
                    var _s = $(tpl({
                        dateMD: helperData.dateMD,
                        dateY: helperData.dateY,
                        title: helperData.title,
                        intro: helperData.intro
                    }));
                    return _s.appendTo(container);
                }
            },
            homeAfterSale: {
                name: "homeAfterSale",
                cnName: "Sale",
                category: "home",
                show: function(tpl, data, main, container) {
                    var _s = $(tpl());
                    return _s.appendTo(container);
                }
            }
        },
        getTplByKey: function(key) {
            return this.tpls.filter(function(t) {
                return t.name === key;
            })[0];
        },
        getForm: getFormTpl,
        getContent: getContentTpl,
        show: function(item, container) {
            var name = item.name,
                sub = item.sub,
                main = item,
                isContainer = false;
            if (container) {
                isContainer = true;
            } else {
                container = $("<div>");
            }

            var tpl = this.getContent(name)
            if (this.data[name].show) {
                this.data[name].show(tpl, sub, main, container);
            } else {
                $(tpl(sub)).appendTo(container);
            }
            return isContainer ? container : container[0].firstChild.outerHTML;
        }
    };
});