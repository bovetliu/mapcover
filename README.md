## Mapcover.js: make developers maps more interactive 
####  Mapcover is one tool to enable you fully customize elements on and over map. "Fully customize" means writing HTML, CSS and JS for elements of map just like what you did on other parts of webpage. 

#### Mapcover currently supports Google Map. Will support Bing Map, Mapbox, and so on. 

For control UI elements like "zoomin", "zoomout", instead of using those original, deeply embeded UI DOMs provided by Map venders, one can create UI DOMs for map at same depth with the map container DIV, just like creating any other DOMs on your webpage. 

For context menu, Mapcover provide one predefined css class ".mc-ascontextmenu". You can turn one element beneath "mapcover container element" into map context menu, by assigning this css class to that element.

[Goto Mapcover.js Demo!](http://www.easysublease.org/mapcoverjs/) and read how it works.

Lets start read code of "demo.js"

```javascript
var mapcover = initMapCover( 'mapcover', 'mapcover-map' );
```
The initMapCover function is gloabally introduced after import "mapcover.js" into your page. And this is the only one it introduced under window scope.
The initMapCover takes two arguements, first one is the id of the element you want it to be "mapcover" DIV.
The second argument is the id of the DIV you want it to be map container. Then Mapcover will put one google map into it. (later I will enable options of whether loading map by Mapcover or loading map yourself, then notifying Mapcover where is target map)

```javascript
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
```
Somewhat like using google map API, you need to put an option object when you "new google.maps.Marker(option)".
This is the option object you are going to put in when you instantiate one instance of the CustomMarker class (which I have already templated basic javascript logic for you, but you still have FULL freedom to customize it.)

the content of attribute 'datacontent' specifies the data which is necessary for the compiled template function of CustomMarker Class to generate HTML for the instance CustomMarker.





