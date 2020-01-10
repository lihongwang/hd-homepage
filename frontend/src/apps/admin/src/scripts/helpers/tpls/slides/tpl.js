var _s = $(tpl({
    items: data.items.map(function(item) {
        return {
            head: item.head,
            title: item.title,
            link: item.link,
            description: item.description,
            src: item.contents && item.contents[0] ? item.contents[0].src : ""
        };
    })
})).carousel();

return _s.appendTo(container);