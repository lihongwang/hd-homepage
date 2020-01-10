//http://preview.themeforest.net/item/creative-agency-bootstrap-html5-template/full_screen_preview/19458377
var _s = $(tpl(data));
debugger;
_s.find('[data-toggle="tab"]').each(function() {
    var $this = $(this);
    $this.tab();
});
_s.find('[data-toggle="dropdown"]').dropdown();
return _s.appendTo(container);