var _s = $(tpl({
    title: data.title,
    description: data.description,
    items: data.items.map(function(item) {
        return {
            tabId: item.tabId,
            tabName: item.tabName,
            title: item.title,
            description: item.description,
            src: item.contents && item.contents[0] ? item.contents[0].src : ""
        }
    })
}));
_s.find('[data-toggle="tab"]').each(function() {
    var $this = $(this);
    $this.tab();
});
return _s.appendTo(container);