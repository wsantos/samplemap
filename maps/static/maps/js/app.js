var map;
var drawingManager;
var color = '#1E90FF';
var selectedShape;
var all_shapes = Array();

/**
 * Create the submit button and events
 * @method find_searchBox
 * @param {PlaceResult} place
 * @return
 */
function SubmitControl(controlDiv, map) {
    controlDiv.style.padding = '5px';

    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'white';
    controlUI.style.borderStyle = 'solid';
    controlUI.style.borderWidth = '1px';
    controlUI.style.cursor = 'pointer';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to submit polygons';
    controlDiv.appendChild(controlUI);

    var controlText = document.createElement('div');
    controlText.style.fontFamily = 'Arial,sans-serif';
    controlText.style.fontSize = '14px';
    controlText.style.paddingLeft = '4px';
    controlText.style.paddingRight = '4px';
    controlText.innerHTML = 'Submit';
    controlUI.appendChild(controlText);

    /**************************************************************************
     * Configure Events
     *************************************************************************/

    google.maps.event.addDomListener(controlUI, 'click', function () {

        shapes = Array();

        for (i in all_shapes) {
            var cur_shape = all_shapes[i];
            var shape = [];

            cur_shape.getPath().forEach(function (latLng, i) {
                shape.push([latLng.lat(), latLng.lng()]);
            });

            shapes.push(shape);
        }

        // Post polygons to the server
        if (shapes.length > 0) {
            $.post(post_url, {
                "mpoly[]": shapes
            }).success(function(){
            
                window.location = search_url;
            
            });
        }else{
            alert("You must have a polygon to submit.");
        }

    });

}

/**
 * Delete de current selected shape
 * @method find_searchBox
 * @param {PlaceResult} place
 * @return
 */
function deleteSelectedShape() {
    if (selectedShape) {
        all_shapes.splice(all_shapes.indexOf(selectedShape), 1);
        selectedShape.setMap(null);
    }
    $("#shape_info").hide();
}

/**
 * Set the curren shape as selected.
 * @method find_searchBox
 * @param {PlaceResult} place
 * @return
 */
function setSelection(shape) {
    clearSelection();
    selectedShape = shape;
    shape.setEditable(true);

    //var arr=[];
    var $point_table = $("<table></table>");
    $point_table.append("<thead><tr><td>Index</td><td>lat</td><td>lng</td></tr></thead>");

    selectedShape.getPath().forEach(function (latLng, i) {
        var point = latLng.toString();
        var latlng = point.match(/\((.*),(.*)\)/);
        $point_table.append("<tr><td>" + i + "</td><td>" + latlng[1] + "</td><td>" + latlng[2] + "</td></tr>");
    });

    $("#points").empty().append($point_table);
    $("#shape_info").show();

}

/**
 * Deselect any shape
 * @method find_searchBox
 * @param {PlaceResult} place
 * @return
 */
function clearSelection() {
    if (selectedShape) {
        selectedShape.setEditable(false);
        selectedShape = null;
        $("#shape_info").hide();
    }
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
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    var submitControlDiv = document.createElement('div');
    var submitControl = new SubmitControl(submitControlDiv, map);

    submitControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(submitControlDiv);

    var polyOptions = {
        strokeWeight: 0,
        fillOpacity: 0.45,
        editable: true,
        draggable: true
    };

    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                google.maps.drawing.OverlayType.POLYGON
            ]
        },
        polygonOptions: polyOptions,
        map: map
    });

    var polygonOptions = drawingManager.get('polygonOptions');
    polygonOptions.fillColor = color;
    drawingManager.set('polygonOptions', polygonOptions);

    /**************************************************************************
     * Configure Events
     *************************************************************************/

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
        if (e.type != google.maps.drawing.OverlayType.MARKER) {
            // Switch back to non-drawing mode after drawing a shape.
            drawingManager.setDrawingMode(null);

            var newShape = e.overlay;
            newShape.type = e.type;

            setSelection(newShape);
            all_shapes.push(newShape);

            // Events for the new shape
            google.maps.event.addListener(newShape, 'click', function () {
                setSelection(newShape);
            });

            google.maps.event.addListener(newShape, 'dragstart', function() {
                //Remove set_at during drag to avoid lag movement.
                google.maps.event.clearListeners(newShape.getPath(), 'set_at');
            });

            google.maps.event.addListener(newShape, 'dragend', function() {
                setSelection(newShape);
                // Reconfigure event set_at after dragend for performance
                google.maps.event.addListener(newShape.getPath(), 'set_at', function (event) {
                    setSelection(newShape);
                });
            });

            google.maps.event.addListener(newShape.getPath(), 'insert_at', function () {
                setSelection(newShape);
            });

        }
    });

    google.maps.event.addDomListener(document.getElementById('delete-polygon'), 'click', deleteSelectedShape);

}

// Initialize
google.maps.event.addDomListener(window, 'load', initialize);
