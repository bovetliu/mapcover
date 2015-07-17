## Mapcover.js: make developers maps more interactive 
####  Mapcover is one set of "DIV-based" "position aboluted" layers over regular map container DIVs. Mapcover will support Google Map, Bing Map, Mapbox, and so on. 
The purpose of mapcover is to help map developers better customize interaction DOMs "on" map.
Original interaction DOMs like markers and infowindow provided Google Map API are infamous for difficulty of being styled, and being selected by jQuery. 

Instead of using those original, deeply embeded UI DOMs provided by Map venders, one can use mapcover to create UI DOMs for his or her map at same depth with the map container DIV, just like creating any other DOMs on your webpage. You can assgin IDs, classes, "data-" attribute and so on to those map interaction DOMs. With management of Mapcover, those map interaction DOMs will behave nicely making people feel that they are parts of the Map.

This yields possiblity to fully customize those map interaction DOMs, and make map interaction DOMs better fit overral style of your site. And you can assign more advanced logic to map interaction UIs to improve possibility.
