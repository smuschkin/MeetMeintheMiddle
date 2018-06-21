// Define globals
let origin = {};
let destination = {};
let theMiddle = {};
let activity = "";
let radius = 0;
let map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: { lat: 41.4993, lng: -81.6944 },
        zoom: 13
    });

    new AutocompleteDirectionsHandler(map);
}

function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'WALKING';
    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var modeSelector = document.getElementById('mode-selector');
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);

    var originAutocomplete = new google.maps.places.Autocomplete(
        originInput, { placeIdOnly: true });
    var destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput, { placeIdOnly: true });

    this.setupClickListener('changemode-walking', 'WALKING');
    this.setupClickListener('changemode-transit', 'TRANSIT');
    this.setupClickListener('changemode-driving', 'DRIVING');

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete. ("This" is redefined by choosing a tavel mode.)
AutocompleteDirectionsHandler.prototype.setupClickListener = function (id, mode) {
    var radioButton = document.getElementById(id);
    var me = this;
    radioButton.addEventListener('click', function () {
        me.travelMode = mode;
        me.route();
    });
};
// This "me" is redefined for the place selected. If not origin, it is the destination. This is function for destination.
AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);
    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
        }
        if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
        } else {
            me.destinationPlaceId = place.place_id;
        }
        me.route();
    });

};

AutocompleteDirectionsHandler.prototype.route = function () {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    var me = this;

    this.directionsService.route({
        origin: { 'placeId': this.originPlaceId },
        destination: { 'placeId': this.destinationPlaceId },
        travelMode: this.travelMode
    }, function (response, status) {
        if (status === 'OK') {
            me.directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
};

// Create object to store location data and find midpoint
function findMiddle() {
    // We are flat Earthers
    theMiddle.lat = (origin.lat + destination.lat) / 2;
    theMiddle.lng = (origin.lng + destination.lng) / 2;
}

const googleAPIkey = "AIzaSyAZ73W29ubLVV9YoW1dsMyob-ZlEiZWoPs";

// Create click event
$("button").click(function () {
    // Get user input and store
    const myLoc = $("#origin-input").val();
    const friendLoc = $("#destination-input").val();
    activity = $("#activity").val();
    radius = $("#radius").val();

    let googleURL = "https://maps.googleapis.com/maps/api/geocode/json?" +
        "address=" + myLoc +
        "&key=" + googleAPIkey;
    // console.log(URL);

    // Make API request
    var getorigin = $.ajax({
        url: googleURL,
        method: "GET",
    }),

        getdestination = getorigin.then(function (response) {
            // console log response
            console.log(response);

            // Store locOne lat-lng coords
            origin.lat = response.results["0"].geometry.location.lat;
            origin.lng = response.results["0"].geometry.location.lng;

            // Update googleURL for location two
            let googleURL = "https://maps.googleapis.com/maps/api/geocode/json?" +
                "address=" + friendLoc +
                "&key=" + googleAPIkey;

            // Make locTwo Ajax request
            return $.ajax({
                url: googleURL,
                method: "GET",
            });
        });

    getdestination.done(function (response) {
        console.log(response);
        destination.lat = response.results["0"].geometry.location.lat;
        destination.lng = response.results["0"].geometry.location.lng;

        findMiddle();

        // Return yelp Ajax request
        getYelpData();
    });
});

// Create function to make Yelp Ajax request
function getYelpData() {
    jQuery.ajaxPrefilter(function (options) {
        if (options.crossDomain && jQuery.support.cors) {
            options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
        }
    });

    const yelpURL = "https://api.yelp.com/v3/businesses/search?" +
        "latitude=" + theMiddle.lat +
        "&longitude=" + theMiddle.lng +
        "&term=" + activity +
        "&radius=" + radius * 1609;

    // Make API call
    $.ajax({
        url: yelpURL,
        crossDomain: true,
        method: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer gfAAsdu8zgOMbEu_1uAb1fMN4JtX982WdDD6dNgnkhbt0u4-nHcuAiL0uSZgRKkG3F4_I9wNNzBsFpZUo3K9RLz4VYswcm9FI44bf4s2S7hg_a8eqPBKnmKbmfUbW3Yx');
        }
    }).then(function (response) {
        // Log response
        console.log(response);

        const labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
        for (i in response.businesses) {
            var lat = response.businesses[i].coordinates.latitude;
            var lng = response.businesses[i].coordinates.longitude;
            var marker = new google.maps.Marker({
                position: { lat, lng },
                map: map,
                label: labels[i],
            });

            var name = response.businesses[i].name;
            var rating = response.businesses[i].rating;
            var reviewCount = response.businesses[i].review_count;
            var address = response.businesses[i].location.address1;
            var yelpLink = response.businesses[i].url;

            // Create marker click function
            marker.addListener("click", function () {
                new google.maps.InfoWindow({
                    content: address,
                }).open(map, marker);
            });

            // Add yelp results to html
            addYelpDiv(labels[i]);

        }
        // function to add yelp results to html
        function addYelpDiv(label) {
            // Create new div
            let newDiv = $("<div>");
            // Add class to div
            newDiv.attr("class", "yelp-result");
            // Append div to main yelp div
            $("#yelp").append(newDiv);
            // Add text to html
            newDiv.text(label + ". " + name);
            if (reviewCount > 1) {
                newDiv.append($("<p>").text("Rated " + rating + " out of 5 by " + reviewCount + " people"));
            } else {
                newDiv.append($("<p>").text("Rated " + rating + " out of 5 by " + reviewCount + " person"));
            }
            newDiv.append($("<a>").attr({ "href": yelpLink, "target": "_blank" }).text("Click for More Info!"));
        }
    });
}