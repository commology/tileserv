/*
 * L.Control.OrderLayers is a control to allow users to switch between different layers on the map.
 */

(function() {

_instance = null;

var vOverlayZIndexBegin = 0;
var dictOverlayZIndex = {};

_getKey = function (id, name) {
    return id + ':' + name;
};

_order = function (layerA, layerB, nameA, nameB) {
    //return nameA < nameB ? -1 : (nameB < nameA ? 1 : 0);

    var keyA = 'L:' + _getKey(layerA.options.id, nameA);
    var keyB = 'L:' + _getKey(layerB.options.id, nameB);
    var ordA = dictOverlayZIndex[keyA];
    var ordB = dictOverlayZIndex[keyB];

    // only sort overlays; skip baselayers' z-index
    if(typeof ordA == 'undefined' || typeof ordB == 'undefined') {
        var ordA = layerA.options.zIndex;
        var ordB = layerB.options.zIndex;
        return ordA < ordB ? -1 : (ordB < ordA ? +1 : 0);
    }

    // console.log('$ ' + ordA + ' ~ ' + ordB + ' = ' + keyA + ' : ' + keyB);
    return ordA < ordB ? -1 : (ordB < ordA ? +1 : 0);
},

L.Control.OrderLayers = L.Control.Layers.extend({
    options: {
    },

    initialize: function (baseLayers, overlays, options) {
        L.Util.setOptions(this, options);
        options.sortLayers = true;
        options.sortFunction = _order;

        dictOverlayZIndex = {};

        this._nBaseLayers = 0;
        for (l in baseLayers) {
            var key = 'B:' + _getKey(baseLayers[l].options.id, l);
            this._nBaseLayers++;
        }
        console.log('BaseLayers x ' + this._nBaseLayers + ' added.');

        vOverlayZIndexBegin = Math.ceil(this._nBaseLayers / 10) * 10;

        this._nOverlays = 0;
        var i = 0;
        for (l in overlays) {
            var key = 'L:' + _getKey(overlays[l].options.id, l);
            this._nOverlays++;
            i++;
            dictOverlayZIndex[key] = vOverlayZIndexBegin + i;
        }
        console.log('Overlays x ' + this._nOverlays + ' added.');

        return L.Control.Layers.prototype.initialize.call(this, baseLayers, overlays, options);
    },

    onAdd: function (map) {
        this._map = map;
        map.on('baselayerchange', this._onBaseLayerChange, this);
        map.on('overlayadd', this._onOverlayAdd, this);
        map.on('overlayremove', this._onOverlayRemove, this);
        return L.Control.Layers.prototype.onAdd.call(this, map);
    },

    onRemove: function (map) {
        this._map = map;
        return L.Control.Layers.prototype.onRemove.call(this, map);
    },

    _onBaseLayerChange: function (e) {
        var key = 'B:' + _getKey(e.layer.options.id, e.name);
    },

    _onOverlayAdd: function (e) {
        var key = 'L:' + _getKey(e.layer.options.id, e.name);
    },

    _onOverlayRemove: function (e) {
        var key = 'L:' + _getKey(e.layer.options.id, e.name);
    }
});

L.Control.Layers.include({
    _base_initLayout: L.Control.Layers.prototype._initLayout,
    _initLayout: function  () {
        this._base_initLayout();

        $(this._overlaysList).sortable({
           cursor: 'move',
           handle: 'a',
           update: function (event, ui) {
               var items = $(this).children();
               for (var i = 0; i < items.length; i++) {
                   item = items[i];
                   layerID = $($(item).find('a')[0]).attr('layer');
                   layerLabel = $($(item).find('a')[0]).attr('label');
                   var key = 'L:' + _getKey(layerID, layerLabel);
                   dictOverlayZIndex[key] = vOverlayZIndexBegin + i + 1;
                   _instance.update(true);
               }
           }
        }).disableSelection();
    },

    _base_update: L.Control.Layers.prototype._update,
    _update: function(skip_update_base) {
        for (var i = 0; i < this._layers.length; i++) {
             var l = this._layers[i];
             if (l.overlay) {
                 var key = 'L:' + _getKey(l.layer.options.id, l.name);
                 l.layer.setZIndex(dictOverlayZIndex[key]);
             }
        }
        if (!skip_update_base) this._base_update();
        if (this.options.sortLayers) {
            this._layers.sort(L.bind(function (a, b) {
                return this.options.sortFunction(a.layer, b.layer, a.name, b.name);
             }, this));
        }
    },
    update: function (skip_update_base) {
        this._update(skip_update_base);
    },

    _base_addItem: L.Control.Layers.prototype._addItem,
    _addItem: function(obj) {
        var l = this._base_addItem(obj);
        var container = $(l).children('div')[0];
        var ret = l;
        if (obj.overlay) {
            ret = this._makeupOrderCtrl(obj, container);
        }
        return ret;
    },

    _base_addLayer: L.Control.Layers.prototype._addLayer,
    _addLayer: function (layer, name, overlay) {
        return this._base_addLayer(layer, name, overlay);
    },

    _makeupOrderCtrl: function (obj, container) {
        var ctrl = $('<a />', {
            id: 'arrow_' + obj.layer.options.id,
            layer: obj.layer.options.id,
            label: obj.name,
            class: 'leaflet-control-sortable-knob',
            text: ' ↕ '
        });
        ctrl.click(function () {
            console.log('DRAG ' + $(this).attr("layer"));
            return false;
        });

        var span = $(container).children('span')[0];
/*
        $(span).click(function () {
            console.log('SPAN ' + $(this).text());
            return false;
        });
*/

        var input = $(container).children('input')[0];
        ctrl.insertBefore(input);
        return container;
    }
});

L.control.orderLayers = function (baseLayers, overlays, options) {
    _instance = new L.Control.OrderLayers(baseLayers, overlays, options);
    return _instance;
};

})();
