$(document).ready(function(){
 
  _.defer(function saferun () {
    /*adjust mapcover height, irrelevant of main demo purpose*/
    $('#mapcover').height( $('#content').height() );

    /*initMapCover takes into two ids, first one for mapcover container, the second one for the map embedded in mapcover*/
    var mapcover = initMapCover( 'mapcover', 'mapcover-map' );


    /*create two Classes for two kinds of CustomMarker, using two different templates specified in index.html
      You are free to pass any compiled template function as argument of initCustomMarker. As long as 
      the compiled template function you selected has following usage
      var generatedText = compiledFunction( dataobj);
    */
    mapcover.initCustomMarker( "CustomMarker1" , _.template( $('#customMarkerTemplate').html()  ));  
    mapcover.initCustomMarker( "CustomMarker2", _.template($('#AnotherClassTemplate').html() ) );

    var custom_marker_option = {
      anchor: null,
      datacontent:{"displayedText":"This Marker1"},
      latLng: new google.maps.LatLng(-34.397, 150.644),
      map: mapcover.model.get("map"),
      mouseover:function(container_node){
        console.log("marker heard mouseover");
        // console.log(event.latLng);
        // console.log(container_node);
        var dom = container_node.childNodes[0];
        dom.classList.add("customized-marker-hover");
      },
      mouseout:function(container_node){
        console.log("marker heard mouseout");
        // console.log(event.latLng);
        // console.log(container_node);
        var dom = container_node.childNodes[0];
        dom.classList.remove("customized-marker-hover");
      },
      click:function(container_node){
        console.log("you clicked me");
      }
    };


    var custom_marker_option2 = _.clone(custom_marker_option);
    var custom_marker_option3 = _.clone(custom_marker_option);
    custom_marker_option2.latLng = new google.maps.LatLng(-33.897, 151.644);
    custom_marker_option2.datacontent = {"displayedText":"Marker2"};
    custom_marker_option3.latLng =new google.maps.LatLng(-34.697, 150.644);
    custom_marker_option3.datacontent = {"hotelname": "JingJiang Hotel", "number":2, "price": "五毛钱"};


    /* assign logic to "zoom in", "zoom out"*/
    /*zoom range: 0-18*/
    $("#zoom-in-control").click(function zoomInControlClicked(){
      var zoom = mapcover.model.get("map").getZoom();
      if (zoom < 18){
        mapcover.model.get("map").setZoom(zoom+1);
      }
    });
    $("#zoom-out-control").click(function zoomOutControlClicked(){
      var zoom = mapcover.model.get("map").getZoom();
      if (zoom > 0){
        mapcover.model.get("map").setZoom(zoom-1);
      }
    });

    /*assign logic to context menu*/
    $("#place-marker1").click(function placeMarker1(){
      console.log("placing marker1");
      /*when this function is invoked, go to mapcover.mode.get("mc_map_events")['rightclick']*/
      console.log(mapcover.model.get("mc_map_events")['rightclick'].latLng);
      var temp_marker_option = {
        anchor: null,
        datacontent:{"displayedText": ($('#content-marker1').val()=="")?"New of Marker1": $('#content-marker1').val()},
        latLng: mapcover.model.get("mc_map_events")['rightclick'].latLng,
        map: mapcover.model.get("map"),
        click:function(container_node){
          alert("I am created By you via ContextMenu");
        }
      };
      mapcover.addCustomMarker("CustomMarker1"  ,temp_marker_option);
      mapcover.hideContextMenu();

    });

    $("#place-marker2").click(function placeMarker1(){
      console.log("placing marker2");
      mapcover.hideContextMenu();
      alert("try impement one yourself by looking at #marker1 click function at demo.js,");

    });


    var temp_marker_controller = mapcover.addCustomMarker("CustomMarker1"  ,custom_marker_option );

    temp_marker_controller.set( "mouseout", function (container_node){  
        console.log("this handler is set by setting controller");
        var dom = container_node.childNodes[0];
        dom.classList.remove("customized-marker-hover");
    });



    var temp_marker1_controller = mapcover.addCustomMarker( "CustomMarker1"  , custom_marker_option2);

    $('#log').html("1. two custom_markers generated")

    setTimeout(function timeout(){
      temp_marker_controller.set("latLng",new google.maps.LatLng(-33.397, 150.644) );
      $('#log').html( $('#log').html()+ "<br/>2. moved one custom marker")
    },3000);

    setTimeout(function timeout(){
      temp_marker1_controller.set("datacontent",  {"displayedText":"changed me !"});

      $('#log').html( $('#log').html()+ "<br/>also change content of another marker")

    },3010);



    setTimeout(function timeout(){
      console.log("vanish it");
      temp_marker_controller.set({ map:null });
      $('#log').html( $('#log').html()+ "<br/>3. make it invisible, and removed from DOM tree")
    } ,6000);

    setTimeout(function timeout(){
      console.log("appear it");
      temp_marker_controller.set({ map:mapcover.model.get("map")});
      $('#log').html( $('#log').html()+ "<br/>4. make it appear again")
    } ,9000);

    setTimeout(function timeout(){
      temp_marker_controller.set({
        mouseover:null,
        mouseout:null
      });
      $('#log').html( $('#log').html()+ "<br/>5. disable its mouseout, mouseover event handlers")

    } ,12000);
    setTimeout(function timeout(){
      temp_marker_controller.delete();
      temp_marker_controller = null;
      console.log(temp_marker_controller);
      $('#log').html( $('#log').html()+ "<br/>6. delete it,removed its references, hoping trash collector will handle it, <br/> make one new instance of class CustomMarker2, ")

      mapcover.addCustomMarker("CustomMarker2"  , custom_marker_option3);

    } ,15000);
  }); // end of _.defer(function, ..);
});