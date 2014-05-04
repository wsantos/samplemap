var map;

/**
 * Method to search places and check if they are inside of a polygon
 * @method find_searchBox
 * @param {PlaceResult} place
 * @return
 */
function find_searchBox(place) {
    var point = Array(
        place.geometry.location.lat(),
        place.geometry.location.lng()
    );

    $.post(search_url, {
        point: point
    }).success(function (data) {
        if (data.count > 0) {
            alert(place.formatted_address + " has poylgons associated");
        } else {
            alert(place.formatted_address + " has not poylgons associated");
        }
    });
}

/**
 * Initialize google maps
 * @method initialize
 * @return
 */
function initialize() {
    var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(-34.397, 150.644),
        disableDefaultUI: true,
        zoomControl: true,
        panControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        draggableCursor: 'crosshair',
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    // Create the search box and link it to the UI element.
    var input = (document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    var searchBox = new google.maps.places.SearchBox((input));

    /**************************************************************************
     * Configure Events
     *************************************************************************/

    google.maps.event.addListener(searchBox, 'places_changed', function () {
        var places = searchBox.getPlaces();
        for (var i = 0, place; place = places[i]; i++) {
            find_searchBox(place);
        }
    });

    google.maps.event.addListener(map, 'click', function (event) {
        var point = Array(event.latLng.lat(), event.latLng.lng());
        $.post(search_url, {
            point: point
        }).success(function (data) {
            if (data.count > 0) {
                alert("This point has " + data.count + " polygon(s) associated");
            } else {
                alert("This point has not polygons associated");
            }
        });
    });

}


// Initialize
google.maps.event.addDomListener(window, 'load', initialize);
