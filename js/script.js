if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(displayLocationInfo);

} else {
    // no can do
}

function displayLocationInfo(position) {
    const lng = position.coords.longitude;
    const lat = position.coords.latitude;

    console.log(`longitude: ${lng} | latitude: ${lat}`)
}

function handleLocationError(error) {

    switch(error.code) {
        case 3:
            // ... deal with timeout
            break;
        case 2:
            // ... device can't get data
            break;
        case 1:
            // ... user said no 
    }

}

