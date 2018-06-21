// Function to find midpoint
function findMiddle() {
    // We are flat Earthers
    theMiddle.lat = (locOne.lat + locTwo.lat) / 2;
    theMiddle.lng = (locOne.lng + locTwo.lng) / 2;
}

// Google Map function
function initMap() {
    map = new google.maps.Map(
        // Get div to insert map into
        document.getElementById('map'),
        // Specify map properties
        { zoom: 11, center: theMiddle }
    );
}

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
        "&radius=" + radius*1609;

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

        // Hide input div
        $("#start-screen").hide();

        // Show map
        initMap();

        // Add markers with labels of yelp results to map
        const labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
        for (i in response.businesses) {
            var lat = response.businesses[i].coordinates.latitude;
            var lng = response.businesses[i].coordinates.longitude;
            new google.maps.Marker({
                position: { lat, lng },
                map: map,
                label: labels[i]
            });

            var name = response.businesses[i].name;
            var rating = response.businesses[i].rating;
            // Add yelp results to html
            addYelpDiv(labels[i], name, rating);

        }
        // function to add yelp results to html
        function addYelpDiv(label, name, rating) {
            // Create new div
            let newDiv = $("<div>");
            // Add class to div
            newDiv.attr("class", "yelp-result");
            // Append div to main yelp div
            $("#yelp").append(newDiv);
            // Add text to html
            newDiv.text(label + ". " + name);
            newDiv.append($("<p>").text("Rating: " + rating));
        }

    });
}

// Define global object ot contain lat-lng coordinates
let locOne = {};
let locTwo = {};
let theMiddle = {};
let activity = "";
let radius = 0;
let map;

// Store google api key
const googleAPIkey = "AIzaSyAZ73W29ubLVV9YoW1dsMyob-ZlEiZWoPs";

// Create click event
$("button").click(function () {
    // Get user input and store
    const myLoc = $("#loc-one").val();
    const friendLoc = $("#loc-two").val();
    activity = $("#activity").val();
    radius = $("#radius").val();

    // Concatenate query url
    let googleURL = "https://maps.googleapis.com/maps/api/geocode/json?" +
        "address=" + myLoc +
        "&key=" + googleAPIkey;
    // console.log(URL);

    // Make API request
    var getLocOne = $.ajax({
        url: googleURL,
        method: "GET",
    }),

        getLocTwo = getLocOne.then(function (response) {
            // console log response
            console.log(response);

            // Store locOne lat-lng coords
            locOne.lat = response.results["0"].geometry.location.lat;
            locOne.lng = response.results["0"].geometry.location.lng;

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

    getLocTwo.done(function (response) {
        console.log(response);
        locTwo.lat = response.results["0"].geometry.location.lat;
        locTwo.lng = response.results["0"].geometry.location.lng;

        // Find the midpoint
        findMiddle();

        // Return yelp Ajax request
        getYelpData();
    });
});
