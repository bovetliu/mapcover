$(document).ready(function readyCB(){
  
  // this mapcover.js occupy position at window
  initMapCover = function ( id_of_map_cover_div, id_of_map_container, map_options ) {    
    var utility = (function createUtility(){
      function Utility(){
        this.selfIntroduction = "I am one utility class,";
      }
      Utility.prototype.getLeftTop = function($dom){
        return {x: $dom.position().left, y: $dom.position().top};
      };
      Utility.prototype.getCornersOf = function ($dom){
        var domleft   = $dom1.position.left;
        var domright  = domleft + $dom1.width();
        var domtop    = $dom1.position.top;
        var dombottom = domtop + $dom1.height();

        var lefttop     = {x:domleft, y:domtop};
        var righttop    = {x:domright, y:domtop};
        var rightbottom = {x:domright, y:dombottom};
        var leftbottom  = {x:domleft, y:dombottom};
        return [lefttop, righttop, rightbottom,leftbottom];
      };
      Utility.prototype.pixelInJQDOM = function(pixel, $dom){
        if ($dom.length != 1){
          console.error("pixelInJQDOM(pixel, $dom) can only take one jQuery DOM as parameter, please make sure you precisely selected the target DOM");
          return;
        }
        var domleft = $dom.position.left;
        var domright = domleft + $dom.width();
        var domtop = $dom.position.top;
        var dombottom = domtop + $dom.height();
        return (pixel.x >= domleft && pixel.x <= domright && pixel.y >= domtop && pixel.y <= dombottom) ? true:false;
      };
      Utility.prototype.areaComparison = function($dom1, $dom2 ){
        if ($dom1.width() * $dom1.height()  < $dom2.width() * $dom2.height())
          return -1;
        else if (  $dom1.width() * $dom1.height()  == $dom2.width() * $dom2.height() )
          return 0;
        else return 1; 
      }

      Utility.prototype.correctPixelAvoidOverflow = function(targetLeftTop, $domInner, $domOuter){
        var ClassRef = this;
        if ( ClassRef.areaComparison($domInner, $domOuter) != -1){
          console.error("correctPixelAvoidOverflow(): $domInner should be smaller than $domOuter");
          return;
        }

        var tbr = targetLeftTop;
        /*currently only works when $domOuter is map cover div*/
        if ($domOuter ==  map_view_unit.model.get('$map_cover_div') ){
          var dom_outer_left = 0;
          var dom_outer_right = dom_outer_left + $domOuter.width();
          var dom_outer_top = 0;
          var dom_outer_bottom = dom_outer_top + $domOuter.height();
        }
        else {
          console.log("not using map_cover_div");
          var dom_outer_left = $domOuter.position().left;
          var dom_outer_right = dom_outer_left + $domOuter.width();
          var dom_outer_top = $domOuter.position().top;
          var dom_outer_bottom = dom_outer_top + $domOuter.height();
        }
        // only use lefttop and rightbottom 
        if (tbr.x < dom_outer_left){
          tbr.x =0;
        }
        if (tbr.y < dom_outer_top){
          tbr.y = 0;
        }
        if (tbr.x+$domInner.outerWidth() > dom_outer_right){
          tbr.x = tbr.x - (tbr.x+$domInner.outerWidth() - dom_outer_right);
        }
        if (tbr.y+$domInner.outerHeight() > dom_outer_bottom){
          tbr.y = tbr.y - ( tbr.y+$domInner.outerHeight() - dom_outer_bottom);
        }      
        return tbr;
      };
      var utility = new Utility();
      return utility;
    }) ();


    var map_control_unit_model = new (Backbone.Model.extend({
      defaults:{
        map_vender:"google",
        map_options:{ center: { lat: -34.397, lng: 150.644},zoom: 8 },  
        map:null,         // internal usage // map placeholder, should be initialized at initialize function of MapViewUnit
        context_menu_shown:false,   // internal control
        $map_cover_div:$('#'+id_of_map_cover_div),
        $map_container:$('#'+id_of_map_container),
        user_gen_classes:new Backbone.Model({}),    // store Class of CustomMarkers
        user_map_events_handlers: new Backbone.Model({}),
        mc_map_events:{}
      },
      initialize:function(){
        /*event management*/
        if (map_options){
          if (map_options.map_vender){
            this.set("map_vender", map_options.map_vender);
          }
          this.set("map_options",map_options);
        }

      }
    })) ();

    var MapViewUnit = Backbone.View.extend({
      // map_control_unit has its own model
      mmoverlay:null,   // this one if for google,
      mapInitialize:function( ){
        var ClassRef = this;
        /*initialize google map*/
        if (ClassRef.model.get("map_vender") == "google")  { //  
          ClassRef.model.set("map", new google.maps.Map(ClassRef.model.get('$map_container')[0],  ClassRef.model.get("map_options") ) );
          var tempmap = ClassRef.model.get("map");
          // variable MMoverlay is just temp Object variable, but the instance of it will be property mmoverly of map_view_unit 
          var MMoverlay = function ( map) {
            // Now initialize all properties.
            //console.log("contructor of MMoverlay");
            this.map_ = map;
            this.div_ = null;
            // Explicitly call setMap on this overlay
            this.setMap(map);
            console.log("map_control_unit property member: mmoverlay init()");
          }
          MMoverlay.prototype = new google.maps.OverlayView();  ///MMoverlay:class inherits OverlayView:class

          /*member methods*/
          MMoverlay.prototype.onAdd = function() {   //overwritten    
            // console.log("es_MMoverlay.js: onAdd()");
            // this inherited and implemented method will only be invoked for one time
            var div = document.createElement('div');
            this.div_ = div;
            // Add the element to the "overlayImage" pane.
            //https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapPanes
            var panes = this.getPanes();
            panes.floatPane.appendChild(this.div_);
          };

          MMoverlay.prototype.draw = function() {  //overwritten
            // This draw method will be invoked when map is loaded, so i have to hide it
            // console.log("es_MMoverlay.js: draw()");
            // this inherited and implemented mehod will be invoked every time when zoom is changed
            var div = this.div_;
            div.style.left = '50px';
            div.style.top = '50px';
            div.style.visibility = 'hidden';
            // fromLatLngToDivPixel finished
          };
          MMoverlay.prototype.onRemove = function() {
            this.div_ = null;
          };
          // end of MMoverlay class declaration
          ClassRef.mmoverlay = new MMoverlay( ClassRef.model.get("map"));   //getPixelInMapcoverContainerFromLatLng() method needs him

          // passing google.maps.MouseEvent  from map to MapViewUnit
          google.maps.event.addListener(tempmap, "rightclick", function rightClickHandlerCall (event ) {ClassRef.mapRightClickHandler(event)});
          google.maps.event.addListener(tempmap, 'click', function clickHandlerCall(event) {ClassRef.mapLeftClickHandler(event)});
          google.maps.event.addListener(tempmap, 'dragstart',function googleMapDragstartMapcoverHandler(event){
            ClassRef.hideContextMenu();
          });


        } // end of "if (ClassRef.model.get("map_vender") == "google")"
        else if (ClassRef.model.get("map_vender") == "mapbox") {
          L.mapbox.accessToken = 'pk.eyJ1IjoiYm93ZWlsaXUyMDE0IiwiYSI6IjYyOGJkN2YwOTZmZDk3ZmFlYWU3ZTZkMTM3N2MzNTI2In0.MISpq-9bA6S3R1DHeGbGow';
          var map = L.mapbox.map(id_of_map_container, 'mapbox.streets').setView(map_options.latLng, map_options.initial_zoom);
          ClassRef.model.set("map", map)
          map.on("click", function mapboxClickHandler (event) {
            ClassRef.mapLeftClickHandler(event);
          });
          map.on("contextmenu", function mapboxCMentuHandler(event){
            ClassRef.mapRightClickHandler(event);
          });

          map.on("dragstart", function(event){
            ClassRef.hideContextMenu();
          })

        }
      },

      /*context menu needs to be specially managed, one mapcover can only has one context menu*/
      //===========context menu management starts =============================
      $context_menu:$('#'+id_of_map_cover_div).find('.mc-ascontextmenu'),

      pixelInContextMenu:function( pixel ){
        // for google, pixel is google.maps.point
        var ClassRef = this;
        if (ClassRef.$context_menu.length != 1){
          console.error("one mapcover instance can only has one $context_menu");
          return;
        }
        if (  utility.pixelInJQDOM(pixel, ClassRef.$context_menu) ){
          return true;
        }
        else return false;
      },

      showContextMenu:function(pixel){
        var ClassRef = this;
        /*here I need to do some offseting, to make sure whole panel of contextMenu in Map Container*/
        var pixel = utility.correctPixelAvoidOverflow( pixel,ClassRef.$context_menu, ClassRef.model.get('$map_cover_div') );
        this.$context_menu.css({"left":pixel.x.toString()+"px", "top": pixel.y.toString() + "px"});
        this.$context_menu.show();
      },

      hideContextMenu:function(){
        if (this.$context_menu.length >0) {
          this.$context_menu.hide();
        }
      },

      contextMenuMeetMouse:function(pixel, mouse_event){
        var ClassRef = this;
        if ( ClassRef.$context_menu &&  ClassRef.$context_menu.length == 1){
          switch(mouse_event){
            case "click":
              console.log("click on map");
              if ( ClassRef.model.get('context_menu_shown') && !ClassRef.pixelInContextMenu(pixel) ){
                ClassRef.hideContextMenu();
                ClassRef.model.set("context_menu_shown", false); // controller event management will handle this
              }        
              break;
            case "rightclick":
              // console.log("valid context menu");
              if ( !ClassRef.model.get('context_menu_shown') ){   // context menu currently shown situation
                ClassRef.showContextMenu(pixel);
                ClassRef.model.set("context_menu_shown", true); // controller event management will handle this
              } else if ( !ClassRef.pixelInContextMenu(pixel) ) {   // context menu currently shown situation, and right click position not in menu
                ClassRef.showContextMenu(pixel);
              }
              break;
            case "othereventsplaceholder":
              break;
            default:
              console.error("contextMenuMeetMouse method of mapcover does not recognize this mouse_event");
              break;
          }
        } else{
          console.log("no valid context_menu");
        } 
      },

      //===========context menu management ends=============================

      //====custom-marker management starts, one public method
      initCustomMarker:function( classname,compiledTemplateFunction ){
        // templateFunction should take 
        var ClassRef = this;
        // ClassRef.compiledCustomMarkerTemplateFunction = compiledTemplateFunction;

        var CustomMarker = function(){};
        if (ClassRef.model.get("map_vender") == "google") {
          CustomMarker = function (anchor,datacontent, latLng, map){

            this._anchor = anchor; //anchor is one point {x: int, y:int}
            this.container_ = document.createElement("div");

            this.dom_ =  $(  compiledTemplateFunction(datacontent) )[0];
            // console.log(compiledTemplateFunction(datacontent))
            // console.log( $(  compiledTemplateFunction(datacontent) )[0]);
            this.setMap(map);
            this.datacontent = datacontent;
            this.latLng = latLng;
            this.width_ = null ;
            this.height_ = null;
            this.container_.appendChild(this.dom_);
          };
          CustomMarker.prototype = new google.maps.OverlayView();   // OverlayView extends MVCObject

          CustomMarker.prototype.compiledTemplateFunction = compiledTemplateFunction;
          // this method is called when setMap(validMap)
          CustomMarker.prototype.onAdd = function(){
            var panes = this.getPanes();
            //console.log(this.dom_);
            if (this.dom_ == null){
              console.log("remaking this.dom_");
              this.dom_ =$( this.compiledTemplateFunction(datacontent) )[0];
            }
            panes.overlayMouseTarget.appendChild(this.container_);
            if (this.width_ == null) {
              this.width_ = this.dom_.offsetWidth ;
            }
            if (this.height_ == null){
              this.height_ = this.dom_.offsetHeight;
              if (this.height_ == 0) alert("fuck! Zero height!");
            }

          };
          CustomMarker.prototype.draw = function(){   // correspons to _reset of mapbox custom_marker
            if (this.getMap()){    // draw function should be valid only when there is a map for this Class
              var overlayProjection = this.getProjection();
              // console.log("draw" + this.latLng);
              var anchor = overlayProjection.fromLatLngToDivPixel(this.latLng);

              if (this.dom_) {
                var bias_height = this._anchor.y / 100 * this.dom_.offsetHeight;
                var bias_width = this._anchor.x / 100 * this.dom_.offsetWidth;

                this.dom_.style.top = Math.round(anchor.y- bias_height).toString()+'px';
                this.dom_.style.left = Math.round( anchor.x - bias_width).toString() + 'px';

              }
            }
          };
          CustomMarker.prototype.onRemove = function() {  // setMap(null) will run this
            console.log("onRemove is called");
            this.dom_.parentNode.parentNode.removeChild(this.container_);
            // this.dom_ = null;
            // $(this.dom_).hide();
          }
          CustomMarker.prototype.setPosition = function(latLng){
            this.latLng = latLng;
          };

          CustomMarker.prototype.refresh = function () {
            console.log("refresh()" + this.datacontent);
            this.container_.removeChild(this.dom_);
            this.dom_ = $(this.compiledTemplateFunction(this.datacontent))[0];
            this.container_.appendChild(this.dom_);
            this.width_ = this.dom_.offsetWidth ;
            this._height_ = this.dom_.offsetHeight;

          }
          CustomMarker.prototype.getDOM =function(){
            return this.dom_;
          }   
          CustomMarker.prototype.getContainer =function(){
            return this.container_;
          }

          CustomMarker.prototype.delete = function(){
            this.dom_.parentNode.removeChild(this.dom_);
            google.maps.event.clearInstanceListeners(this.dom_);
            google.maps.event.clearInstanceListeners(this);
            this.dom_ = null;
            this.height_ = null;
            this.width_ = null;
          }

        }//if (ClassRef.model.get("map_vender") == "google") {
        //======end of google map API CustomMarker specification ===========

        else if (ClassRef.model.get("map_vender") == "mapbox") {

          CustomMarker = L.Class.extend({
            includes: L.Mixin.Events,
                                 //anchor,datacontent, latLng, map
            initialize: function ( anchor,datacontent, latLng, map, options) { 
              this._datacontent = datacontent;
              this._latLng = latLng;
              this._anchor = anchor;
              this._map = map;
              this._container = document.createElement("div");
              this._dom =  $(  compiledTemplateFunction(datacontent) )[0];
              this._container.appendChild(this._dom);
              if (ClassRef.model.get("map").options.zoomAnimation && L.Browser.any3d) {   // if current browser support
                L.DomUtil.addClass(this._container, 'leaflet-zoom-animated');
              } else {
                L.DomUtil.addClass(this._container, 'leaflet-zoom-hide');
              }
              L.setOptions(this, options);
            },
            refresh:function(){
              // console.log("refresh(): " + this._datacontent);
              this._container.removeChild(this._dom);
              this._dom = $(this.compiledTemplateFunction(this._datacontent))[0];
              this._container.appendChild(this._dom);
            },

            // this function will be called internally, and be called only once
            onAdd: function (map) {
              if (map){
                // console.log("inside map @@@@@@@@@@@@@@@@@@");
                this._map = map;
                if (!this._dom) {
                  this._initDom();
                }
                if (this._dom.style.display == "none"){
                  this._dom.style.display = "initial";
                }
                map._panes.overlayPane.appendChild(this._container);
                map.on('viewreset', this._reset, this);

                if (map.options.zoomAnimation && L.Browser.any3d) {
                  map.on('zoomanim', this._animateZoom, this);
                }
                this._reset();  // have to call this manually for one time, to set the element at right position
              }
            },

            // _initDom will be called in onAdd()
            _initDom: function () {  
              this._dom = $(this.compiledTemplateFunction(this._datacontent))[0];
              this._container.appendChild(this._dom);
            },

            compiledTemplateFunction: compiledTemplateFunction,

            // TODO: following function needs to tuned outside
            relocateAnchor:function(point, dom){
              if (this._anchor) {
                var bias_height = Math.round(dom.clientHeight * this._anchor.y/ 100 );
                var bias_width = Math.round(dom.clientWidth * this._anchor.x/100);
                point.x = point.x - bias_width;
                point.y = point.y - bias_height;
              } 
              return point;
            },

            _animateZoom: function (e) {
              // console.log(e);
              // e.zoom is target zoom, when this function is called, zoom action has not finished
              var map = this._map,
                  topLeft = map._latLngToNewLayerPoint(this._latLng, e.zoom, e.center);
              L.DomUtil.setPosition(this._container, this.relocateAnchor(topLeft, this._dom));
            },

            //main behavior of this _reset() is to change size
            // the purpose of _reset is redraw this element when view changed
            _reset: function () {
              //TODO: should do _latLng preprocessing to make sure latLng object is passed in
              var container   = this._container,
                  topLeft = this._map.latLngToLayerPoint(this._latLng);
              L.DomUtil.setPosition(container, this.relocateAnchor(topLeft, this._dom));
            },


            onRemove: function (map) {
              map.getPanes().overlayPane.removeChild(this._container);
              this._dom.style.display="none";
              // map.off('viewreset', this._reset, this);
              // if (map.options.zoomAnimation) {
              //   map.off('zoomanim', this._animateZoom, this);
              // }
            },

            delete: function (map) {
              map.getPanes().overlayPane.removeChild(this._container);
              this._dom = null;
              map.off('viewreset', this._reset, this);
              if (map.options.zoomAnimation) {
                map.off('zoomanim', this._animateZoom, this);
              }
            },
            //convenience method
            addTo: function (map) {
              if (map){
                this._map = map;
                map.addLayer(this);
                return this;
              }
            },

            getAttribution: function () {
              return this.options.attribution;
            },
            getContainer:function(){
              return this._container;
            },
            getDOM: function(){
              return this._dom;
            }

          });
        }// else if (ClassRef.model.get("map_vender") == "mapbox") {
        //======end of mapbox CustomMarker specification

        var user_gen_classes = ClassRef.model.get("user_gen_classes");  // get on backbone holder
        user_gen_classes.set(classname, CustomMarker);
        // console.log(classname);
      },
      // compiledCustomMarkerTemplateFunction:null,  // this one is going to be populated by initCustomMarker method
      // CustomMarker:null,   // Class CustomMarker
      
      _initCustomMarkerController:function(){
        //=====start of CustomMarkerController specification
        // this method build controller class of CustomMarker
        var ClassRefOuter = this;

        ClassRefOuter.CustomMarkerController = Backbone.Model.extend ({
          //when creating instance, there is custom_marker 
          defaults:{
            click:null,       // function placeholder
            dblclick:null,     // function placeholder
            drag:null,        // function placeholder
            dragend:null,     // ...
            dragstart:null,
            mousemove:null,
            mouseout:null,
            mouseover:null,
            rightclick:null,

            anchor:null,
            datacontent:null,
            latLng:null,
            map:null
          },
          delete:function(){
            this.get("custom_marker").delete();
            this.set("custom_marker", null); // remove reference of this custom overlay Class

          },
          initialize:function(){
            var ClassRef = this;
            var mouse_events =  _.keys(this.omit('anchor','datacontent', 'latLng', 'map','custom_marker'));

            if (ClassRefOuter.model.get("map_vender") == "google") {
              _.each(mouse_events, function( keyname, index, list){
                ClassRef.on("change:"+keyname, function changeHandler () {

                  if ( typeof ClassRef.get(keyname) == 'function') {
                    console.log(keyname + "changed");
                    google.maps.event.addDomListener( 
                      ClassRef.get('custom_marker').getContainer(), 
                      keyname, 
                      ClassRef.get(keyname).bind( ClassRef.get("custom_marker") ) 
                    );           
                  }
                  else if (ClassRef.get(keyname) == null){
                    console.log("cancel one event handler of " + keyname);
                    google.maps.event.clearListeners( ClassRef.get('custom_marker').getContainer() , keyname);

                  }

                  else {
                    console.log("content of " + keyname + " is not event");
                  }
                });
              });  // _.each(...);

              ClassRef.on("change:latLng", function latLngChangeHandlerOfCustomMarker () {
                if (ClassRef.get("latLng").lat && ClassRef.get("latLng").lng){
                  ClassRef.get("custom_marker").latLng = ClassRef.get("latLng");
                  ClassRef.get("custom_marker").draw();
                }else {
                  console.error("latLngChangeHandlerOfCustomMarker() encountered invalid latLng");
                }
              });

              ClassRef.on("change:datacontent", function datacontentChangeHandlerOfCustomMarker(){
                ClassRef.get("custom_marker").datacontent = ClassRef.get("datacontent");
                ClassRef.get("custom_marker").refresh();
                ClassRef.get("custom_marker").draw();
              });
              ClassRef.on("change:map", function mapChangeHandlerOfCustomMarker(){
                console.log("controller map changed");
                ClassRef.get("custom_marker").setMap( ClassRef.get("map") );
                // ClassRef.get("custom_marker").draw();
              });
            } // if (ClassRef.model.get("map_vender") == "google") {

            else if (ClassRefOuter.model.get("map_vender") == "mapbox") {
              _.each(mouse_events, function( keyname, index, list){
                ClassRef.on("change:"+keyname, function changeHandler () {
                  if ( typeof ClassRef.get(keyname) == 'function') {
                    console.log(keyname + "changed");
                    ClassRef.set(keyname+'_realhandler', ClassRef.get(keyname));
                    L.DomEvent.addListener( ClassRef.get('custom_marker').getContainer(), keyname, ClassRef.get(keyname+'_realhandler'), ClassRef.get("custom_marker"));           
                  }
                  else if (ClassRef.get(keyname) == null){
                    console.log("cancel one event handler of " + keyname);
                    L.DomEvent.removeListener( ClassRef.get('custom_marker').getContainer() , keyname, ClassRef.get(keyname+'_realhandler') );
                    ClassRef.set(keyname+'_realhandler', null);
                  }
                  else {
                    console.error("content of " + keyname + " is not event");
                  }
                });
              });  // _.each(...);

              ClassRef.on("change:latLng", function latLngChangeHandlerOfCustomMarker () {
                if (ClassRef.get("latLng").lat && ClassRef.get("latLng").lng){
                  ClassRef.get("custom_marker")._latLng = ClassRef.get("latLng");
                  ClassRef.get("custom_marker")._reset();
                }else {
                  console.error("latLngChangeHandlerOfCustomMarker() encountered invalid latLng");
                }
              });

              ClassRef.on("change:datacontent", function datacontentChangeHandlerOfCustomMarker(){
                ClassRef.get("custom_marker")._datacontent = ClassRef.get("datacontent");
                ClassRef.get("custom_marker").refresh();
                ClassRef.get("custom_marker")._reset();
              });

              ClassRef.on("change:map", function mapChangeHandlerOfCustomMarker(){
                console.log("controller map changed");
                if (ClassRef.get("map")){
                  ClassRef.get("custom_marker").addTo( ClassRef.get("map") );
                }
                else {
                  // map is at map_view_unit, so use ClassRefOuter
                  ClassRefOuter.model.get("map").removeLayer( ClassRef.get("custom_marker") );
                }
                // ClassRef.get("custom_marker").draw();
              });
            }  
          } // end of initialize(){}
        });  // end of ClassRef.CustomMarkerController = Backbone.Model.extend ({

        // end of = CustomMarkerController class definition
      },

      CustomMarkerController:null,

      addCustomMarker:function( classname, options){

        var user_gen_classes = this.model.get("user_gen_classes");

        var CustomMarker = user_gen_classes.get(classname);
        var temp_custom_marker = new CustomMarker(options.anchor, options.datacontent, options.latLng, options.map);
        console.log("generated temp_custom_marker: ");
        if( this.model.get("map_vender") == "mapbox" && options.map !== null){
          temp_custom_marker.addTo(options.map);
        }
        // console.log(temp_custom_marker);
        var temp_custom_marker_controller = new this.CustomMarkerController({ "custom_marker": temp_custom_marker});
        // enable custom_marker have reference to its controller
        temp_custom_marker._controller = temp_custom_marker_controller;
        _.each(_.keys(_.omit(options, 'anchor', 'datacontent', 'latLng', 'map')), function(keyname, index, ar){
          if (typeof options[keyname] == 'function' || options[keyname] == null) {
            temp_custom_marker_controller.set(keyname, options[keyname]);
          }
        });

        // for key options setting, suppressing change event
        temp_custom_marker_controller.set({
          anchor:options.anchor,
          datacontent:options.datacontent,
          latLng:options.latLng,
          map:options.map
        }, {silent:true}); 

        return temp_custom_marker_controller;
      },
      //====custom-marker management ends

      getPixelInMapcoverContainerFromLatLng:function (event){
        var ClassRef = this;
        var tbr = null;
        if (ClassRef.model.get("map_vender") == "google"){
          tbr = ClassRef.mmoverlay.getProjection().fromLatLngToContainerPixel(event.latLng); // for google,  the returned Object is google.maps.Point
        }
        else if (ClassRef.model.get("map_vender") == "mapbox"){
          tbr = ClassRef.model.get('map').latLngToContainerPoint(event.latlng);
        }
        return tbr; 
      },

      mapLeftClickHandler:function(event){
        var ClassRef = this;
        var pixel = ClassRef.getPixelInMapcoverContainerFromLatLng(event);
        // console.log("left click at pixel: " + pixel);
        ClassRef.contextMenuMeetMouse(pixel, "click");
        ClassRef.model.get("mc_map_events")["click"] = event;

      },
      mapRightClickHandler:function(event){
        var ClassRef = this;
        var pixel = ClassRef.getPixelInMapcoverContainerFromLatLng(event);
        ClassRef.contextMenuMeetMouse(pixel, "rightclick");
        ClassRef.model.get("mc_map_events")["rightclick"] = event;
      },

      initialize:function (){
        console.log("map_view_unit init()");
        var ClassRef = this;

        ClassRef.mapInitialize(); 
        ClassRef._initCustomMarkerController();  
        if ($('.mc-ascontextmenu').length == 1){
          console.log("map cover has one context menu.");
        }   
      }
    });  // MapControlUnit Class definition ends

    var map_view_unit = new MapViewUnit({model: map_control_unit_model}); 

    return map_view_unit;
  };
}); // end of ready();