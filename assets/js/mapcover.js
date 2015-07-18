$(document).ready(function readyCB(){
  
  mapcover = (function () {
    
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
        if ($domOuter ==  map_view_unit.$map_cover_div ){
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
        map:null,          // map placeholder, should be initialized at initialize function of MapViewUnit
        context_menu_shown:false,
        newest_right_click_on_map:null,  // google.maps.MouseEvent instance
        newest_click_on_map:null         // google.maps.MouseEvent instance
      },
      initialize:function(){
        /*event management*/

      }
    })) ();

    var MapViewUnit = Backbone.View.extend({
      // map_control_unit has its own model
      mmoverlay:null,   // this one if for google,
      $map_cover_div: $("#mapcover"), 
      $map_container:$("#mapcover-map"),

      mapInitialize:function(){
        var ClassRef = this;
        /*initialize google map*/
        if (ClassRef.model.get("map_vender") == "google")
        {   

          ClassRef.model.set("map", new google.maps.Map(document.getElementById('mapcover-map'),  ClassRef.model.get("map_options") ) );
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
            var panes = this.getPanes();
            panes.overlayImage.appendChild(this.div_);
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
          // end of MMoverlay class declaration
          ClassRef.mmoverlay = new MMoverlay( ClassRef.model.get("map"));

          // passing google.maps.MouseEvent  from map to MapViewUnit
          google.maps.event.addListener(tempmap, "rightclick", function rightClickHandlerCall (event ) {ClassRef.mapRightClickHandler(event)});
          google.maps.event.addListener(tempmap, 'click', function clickHandlerCall(event) {ClassRef.mapLeftClickHandler(event)});

        } // end of "if (ClassRef.model.get("map_vender") == "google")"
      },

      /*context menu needs to be specially managed, one mapcover can only has one context menu*/
      //===========context menu management starts =============================
      $context_menu:$('.mc-ascontextmenu'),

      pixelInContextMenu:function( pixel ){
        // for google, pixel is google.maps.point
        var ClassRef = this;
        if (ClassRef.$context_menu.length != 1){
          console.error("one mapcover instance can only has one $context_menu");
          return;
        }
        if (  ClassRef.pixelInMapCoverUIDOM(pixel, ClassRef.$context_menu) ){
          return true;
        }
        else return false;
      },

      showContextMenu:function(pixel){
        var ClassRef = this;
        /*here I need to do some offseting, to make sure whole panel of contextMenu in Map Container*/
        var pixel = utility.correctPixelAvoidOverflow( pixel,ClassRef.$context_menu, ClassRef.$map_cover_div );
        this.$context_menu.css({"left":pixel.x.toString()+"px", "top": pixel.y.toString() + "px"});
        this.$context_menu.show();
      },

      hideContextMenu:function(){
        this.$context_menu.hide();
      },

      contextMenuMeetMouse:function(pixel, mouse_event){
        var ClassRef = this;
        if ( ClassRef.$context_menu &&  ClassRef.$context_menu.length == 1){
          switch(mouse_event){
            case "click":

              if ( ClassRef.model.get('context_menu_shown') && !ClassRef.pixelInContextMenu(pixel) ){
                ClassRef.hideContextMenu();
                ClassRef.model.set("context_menu_shown", false); // controller event management will handle this
              }        
              break;
            case "rightclick":
              console.log("valid context menu");
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


      pixelInMapCoverUIDOM:function(pixel, $dom){
        return utility.pixelInJQDOM(pixel, $dom);
      },

      getPixelInMapcoverContainerFromLatLng:function (latLng){
        var ClassRef = this;
        var tbr = null;
        if (ClassRef.model.get("map_vender") == "google"){
          tbr = ClassRef.mmoverlay.getProjection().fromLatLngToContainerPixel(latLng); // for google,  the returned Object is google.maps.Point
        }
        return tbr; 
      },

      mapLeftClickHandler:function(event){
        // console.log("left click at: " + event.latLng);
        var ClassRef = this;
        var pixel = ClassRef.getPixelInMapcoverContainerFromLatLng(event.latLng);
        console.log("left click at pixel: " + pixel);
        ClassRef.contextMenuMeetMouse(pixel, "click");
        ClassRef.model.set("newest_click_on_map", event);

      },
      mapRightClickHandler:function(event){
        // console.log("right click at: " + event.latLng);
        var ClassRef = this;
        var pixel = ClassRef.getPixelInMapcoverContainerFromLatLng(event.latLng);
        console.log("right click at pixel: " + pixel);
        ClassRef.contextMenuMeetMouse(pixel, "rightclick");
        ClassRef.model.set("newest_right_click_on_mapw",event);
       
      },


      initialize:function (){
        console.log("map_view_unit init()");
        var ClassRef = this;
        ClassRef.mapInitialize();   
        if ($('.mc-ascontextmenu').length == 1){
          console.log("map cover has one context menu.");
        }   
      }
    });  // MapControlUnit Class definition ends

    var map_view_unit = new MapViewUnit({model: map_control_unit_model}); 

    return map_view_unit;

  }) ();


}); // end of ready();