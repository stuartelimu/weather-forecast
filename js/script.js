// register service worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
}
  

const apiKey = "86b04004cb4cf5cc52ad1ef8433155c8";

console.log(localStorage);

let articlesArray = Object.values(window.localStorage);

console.log(articlesArray);

articlesArray.forEach(article => {
    data = JSON.parse(article);
    if (typeof(data === "object") && data.hasOwnProperty("weather")) {
        mdArticleMaker(data);
    } 
    
    if (typeof(data === "object") && data.hasOwnProperty("list")) {
        lgArticleMaker(data);
    } 
})


if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(
        displayLocationInfo,
        handleLocationError,
        { maximumAge: 1500000, timeout: 0 }
    );

}

function cachedFetch(url, options) {
    let expiry = 5 * 60 // 5 min default
    if (typeof options === 'number') {
        expiry = options
        options = undefined
    } else if (typeof options === 'object') {
        // I hope you didn't set it to 0 seconds
        expiry = options.seconds || expiry
    }
    // Use the URL as the cache key to sessionStorage
    let cacheKey = url;

    // START new cache HIT code
    let cached = sessionStorage.getItem(cacheKey)
    let whenCached = localStorage.getItem(cacheKey + ':ts')
    if (cached !== null && whenCached !== null) {
        // it was in sessionStorage! Yay!
        // Even though 'whenCached' is a string, this operation
        // works because the minus sign converts the
        // string to an integer and it will work.
        let age = (Date.now() - whenCached) / 1000
        if (age < expiry) {
            let response = new Response(new Blob([cached]))
            return Promise.resolve(response);
        } else {
            // We need to clean up this old key
            localStorage.removeItem(cacheKey)
            localStorage.removeItem(cacheKey + ':ts')
        }
    }
    // END new cache HIT code


    return fetch(url, options).then(response => {
        // let's only store in cache if the content-type is
        // JSON or something non-binary
        if (response.status === 200) {
            let ct = response.headers.get('Content-Type');
            if (ct && (ct.match(/application\/json/i) || ct.match(/text\//i))) {
                // There is a .json() instead of .text() but
                // we're going to store it in sessionStorage as
                // string anyway.
                // If we don't clone the response, it will be
                // consumed by the time it's returned. This
                // way we're being un-intrusive.
                response.clone().text().then(content => {
                    localStorage.setItem(cacheKey, content)
                    localStorage.setItem(cacheKey+':ts', Date.now())
                })
            }
        }
        return response;
    })

} 

function displayLocationInfo(position) {
    const lng = position.coords.longitude;
    const lat = position.coords.latitude;

    console.log(`longitude: ${lng} | latitude: ${lat}`)

    // const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude={hourly,minutely}&appid=${apiKey}&units=metric`;
    // const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&cnt=7&units=metric`;

    const url = `http://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lng}&cnt=7&appid=${apiKey}&units=metric`;

    cachedFetch(url)
        .then(response => response.json())
        .then(data => {
            // do something
            console.log(data)
            lgArticleMaker(data);
        })
        .catch(() => {
            console.log("something wrong happened")
        });
    
}

function handleLocationError(error) {

    switch(error.code) {
        case 3:
            // ... deal with timeout
            // timeout was hit, meaning there's nothing in the cache
            // provide default location

            // make a non-cached request to get the actual position
            navigator.geolocation.getCurrentPosition(displayLocationInfo, handleLocationError);
            break;
        case 2:
            // ... device can't get data
            break;
        case 1:
            // ... user said no 
    }

}

const form = document.querySelector("#search-form");
const input = document.querySelector("#search-form input");

form.addEventListener("submit", e => {
    e.preventDefault();
    const inputVal = input.value;

    const listItems = document.querySelectorAll(".card-md");

    const listItemsArray = Array.from(listItems);
    
    if (listItemsArray.length > 0) {
        const filteredArray = listItemsArray.filter(el => {
            let content = "";
            if (inputVal.includes(",")) {
                if (inputVal.split(",")[1].length > 2) {
                    inputVal = inputVal.split(",")[0];
                    content = el.querySelector(".city-name").textContent.toLowerCase();
                } else {
                    content = el.querySelector(".city-name").dataset.name.toLowerCase();
                }
            } else {
                content = el.querySelector(".city-name").textContent.toLowerCase();
            }
            return content == inputVal.toLowerCase();
        });
        
        if (filteredArray.length > 0) {
            console.log('already there');
            // msg.textContent = `You already know the weather for ${
            // filteredArray[0].querySelector(".city-name span").textContent
            // } ...otherwise be more specific by providing the country code as well 😉`;
            form.reset();
            input.focus();
            return;
        }
    }

    const url = `http://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;

    cachedFetch(url)
        .then(response => response.json())
        .then(data => {
            mdArticleMaker(data);
        })
        .catch(() => {
            console.log("something wrong happened")
        });


//  msg.textContent = "";
    form.reset();
    input.focus();

})

function mdArticleMaker(data) {

    const prev = document.querySelector(".prev-cards")

    const { weather,main, name, sys } = data;

    const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;

    const article = document.createElement("article");
    article.classList.add("card-md");
    const markup = `
    <header>
        <h3 class="city-name" data-name="${name},${sys.country}">${name}</h3>
        <h3>${weather[0]["description"]}</h3>
    </header>
            
    <figure>
        <figcaption>
            <h2>${main.temp}<sup>o</sup>C</h2>
        </figcaption>
        <img src=${icon} />
    </figure>

    `;
    article.innerHTML = markup;
    prev.appendChild(article);
}

function lgArticleMaker(data) {

    const curr = document.querySelector(".curr-cards")
    const { list } = data;

    list.forEach((element,  index) => {
        const { weather,main, name, sys } = element;
        const article = document.createElement("article");
        const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;
        if (index === 0) {
            article.classList.add("card-lg");
        } 

        article.classList.add("card-sm");
        const markup = `
            <section>
                <header>
                    <h3 data-name="${name},${sys.country}">${name}</h3>
                    <h3>${weather[0]["description"]}</h3>
                </header>
                <figure>
                    <figcaption>
                        <h2>${main.temp}<sup>o</sup>C</h2>
                    </figcaption>
                    <img src=${icon} />
                </figure>
            </section>
        `;
        article.innerHTML = markup;
        curr.appendChild(article);
    })
}





