/**
 * 腾讯地图
 */
L.TileLayer.TencentLayer = L.TileLayer.extend({

    /**
     * type: Normal.Map (普通地图), Normal.Road (路网), Satellite.Map (卫星), Terrain.Map (地形)
     * 如果实现HYBRID效果则需要叠加Normal.Road和Satellite两个图层
     */
    initialize: function(type, options) {
        options.subdomains = [0, 1, 2];
        L.Util.setOptions(this, options);
        this._type = type || 'Normal.Map';
    },

    getTileUrl: function(tilePoint) {

        this._url = "http://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style={t}";

        var urlArgs = {
            z: tilePoint.z,
            x: tilePoint.x,
            y: Math.pow(2, tilePoint.z) - 1 - tilePoint.y
        };

        switch (this._type) {
            case 'Normal.Map':
                this._url = this._url.replace('{t}', 0);
                break;
            case 'Normal.Road':
                this._url = this._url.replace('{t}', 1);
                break;
            case 'Satellite.Map':
                this._url = "http://p{s}.map.gtimg.com/sateTiles/{z}/{x16}/{y16}/{x}_{y}.jpg";
                urlArgs.x16 = Math.floor(tilePoint.x / 16);
                urlArgs.y16 = Math.floor((Math.pow(2, tilePoint.z) - 1 - tilePoint.y) / 16);
                break;
            case 'Terrain.Map':
                this._url = "http://p{s}.map.gtimg.com/demTiles/{z}/{x16}/{y16}/{x}_{y}.jpg";
                urlArgs.x16 = Math.floor(tilePoint.x / 16);
                urlArgs.y16 = Math.floor((Math.pow(2, tilePoint.z) - 1 - tilePoint.y) / 16);
                break;
        }

        return L.Util.template(this._url, L.extend(urlArgs, this.options, {
            s: this._getSubdomain(tilePoint)
        }));
    }
});

L.tileLayer.tencentLayer = function(key, options) {
  return new L.TileLayer.TencentLayer(key, options);
};
