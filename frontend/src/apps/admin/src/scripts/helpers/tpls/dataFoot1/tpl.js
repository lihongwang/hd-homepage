//http://responsiveexpert.com/themes/lumen/html/index.html
var _s = $(tpl(data));
require(["async!http://api.map.baidu.com/api?v=2.0&ak=3fe47ff2ae8bf1527c22655ae14df84d"], function() {
    var opts = {
            width: 100, // 信息窗口宽度
            height: 50, // 信息窗口高度
            title: "互道科技" // 信息窗口标题
        },
        infoWindow = new BMap.InfoWindow("泰豪软件园南区综合楼二楼", opts), // 创建信息窗口对象
        map = new BMap.Map("baiduMap"),
        point = new BMap.Point(115.979962, 28.698005),
        showinfo = function() {
            map.centerAndZoom(point, 16);
            map.clearOverlays();
            var marker = new BMap.Marker(point);
            map.addOverlay(marker);
            marker.openInfoWindow(infoWindow); // 打开信息窗口
            marker.addEventListener("dragend", function(e) {
                this.openInfoWindow(infoWindow);
                infoWindow.redraw();
            });
            marker.addEventListener("click", function(e) {
                this.openInfoWindow(infoWindow);
                infoWindow.redraw();
            });
        };
    showinfo();
    // map.enableScrollWheelZoom();
    map.enableDoubleClickZoom(); //启用双击放大。
    map.addControl(new BMap.NavigationControl());
});

return _s.appendTo(container);