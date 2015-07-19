## Mapcover.js: make developers maps more interactive 
####  Mapcover is one tool to enable you fully customize elements on and over map. "Fully customize" means writing HTML, CSS and JS for elements of map just like what you did on other parts of webpage. 

#### Mapcover currently supports Google Map. Will support Bing Map, Mapbox, and so on. 

For control UI elements like "zoomin", "zoomout", instead of using those original, deeply embeded UI DOMs provided by Map venders, one can create UI DOMs for map at same depth with the map container DIV, just like creating any other DOMs on your webpage. 

For context menu, Mapcover provide one predefined css class `.mc-ascontextmenu`. So you can turn one element beneath "mapcover container element" into map context menu, by assigning this css class to that element. This css class `.mc-ascontextmenu` does not specify any concrete CSS, just serving as indentifier for Mapcover to know which one is context menu target.

<a href="http://www.easysublease.org/mapcoverjs/" target="_blank">Goto 15seconds Mapcover.js Demo</a> and read following to learn it works. Then you can right click on map to start playing with Mapcover.

Let's start from ["demo.js"](https://github.com/bovetliu/mapcover/blob/master/assets/js/demo.js)

```javascript
var mapcover = initMapCover( 'mapcover', 'mapcover-map' );
```
The initMapCover function is gloabally introduced after import "mapcover.js" into your page. And this is the only one it introduced under window scope.
The initMapCover takes two arguements, first one is the id of the element you want it to be "mapcover" DIV.
The second argument is the id of the DIV you want it to be map container. Then Mapcover will put one google map into it. (later I will enable options of whether loading map by Mapcover or loading map yourself, then notifying Mapcover where is target map)



```javascript
mapcover.initCustomMarker( "CustomMarker1" , _.template( $('#customMarkerTemplate').html()  ));  
mapcover.initCustomMarker( "CustomMarker2", _.template($('#AnotherClassTemplate').html() ) );
```
create two Classes for two kinds of CustomMarker, using two different templates specified in "index.html"
You are free to pass in any compiled template function as argument of initCustomMarker(). As long as 
the compiled template functions has usage similar with following
```javascript
var generatedText = compiledFunction( dataobj);
```


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
Somewhat like using google map API, you need to pass in an option object when you "new google.maps.Marker(option)".
This is the option object needed when you instantiate one instance of the CustomMarker class (which I have already templated basic javascript logic to make it behave like an marker, but still allow you to FULLY customize it.)

the content of attribute 'datacontent' specifies the data which is necessary for the compiled template function of CustomMarker Class to generate HTML for instances of CustomMarker.

```javascript
var custom_marker_option2 = _.clone(custom_marker_option);
var custom_marker_option3 = _.clone(custom_marker_option);
custom_marker_option2.latLng = new google.maps.LatLng(-33.897, 151.644);
custom_marker_option2.datacontent = {"displayedText":"Marker2"};
custom_marker_option3.latLng =new google.maps.LatLng(-34.697, 150.644);
custom_marker_option3.datacontent = {"hotelname": "JingJiang Hotel", "number":2, "price": "五毛钱"};
```
above code show just create two different marker options. But please pay attention, 
the `custom_marker_options3` is for `CustomMarker2`, so it has different structure in terms of `datacontent` property.



```javascript
var temp_marker_controller = mapcover.addCustomMarker("CustomMarker1"  ,custom_marker_option );
```
Above code shows adding one instance of `CustomMarker1` to the map using `custom_marker_option`. Also `addCustomMarker()` return one controller for this instance of `CustomMarker1`



```javascript
setTimeout(function timeout(){
  temp_marker_controller.set("latLng",new google.maps.LatLng(-33.397, 150.644) );
  $('#log').html( $('#log').html()+ "<br/>2. moved one custom marker")
},3000);
```
By setting the `latLng` property of controller, the geoposition of this marker is changed.


```javascript
  temp_marker_controller.set({ map:null });
```
By setting `map` null, the marker is temporarily removed from DOM tree and hidden.


```javascript
temp_marker_controller.set({ map:mapcover.model.get("map")});
```
I store the map object in the model of Mapcover. By setting map to the working map, marker appears.


```javascript
temp_marker_controller.set({
  mouseover:null,
  mouseout:null
});
```
Remove these two event handlers. Remember, when I create the first marker option, I specified three event handlers respectively for 'mouseover', 'mouseout', 'click'. For a complete reference of MouseEvent, please go to Google Map API V3 reference. 


```javascript
setTimeout(function timeout(){
  temp_marker_controller.delete();
  temp_marker_controller = null;
  mapcover.addCustomMarker("CustomMarker2"  , custom_marker_option3);
} ,15000);
```
Attempting delete the first instance of Class CustomMarker1. 
At the same time, add one instance of CustomMarker2 with `custom_marker_option3` loaded


