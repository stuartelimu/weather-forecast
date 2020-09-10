const apiKey = "86b04004cb4cf5cc52ad1ef8433155c8";

if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(displayLocationInfo);

} else {
    // no can do
}

function displayLocationInfo(position) {
    const lng = position.coords.longitude;
    const lat = position.coords.latitude;

    console.log(`longitude: ${lng} | latitude: ${lat}`)

    // const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude={hourly,minutely}&appid=${apiKey}&units=metric`;
    // const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&cnt=7&units=metric`;

    const url = `http://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lng}&cnt=7&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // do something
            console.log(data)
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
                    <header>
                        <h3>Monday</h3>
                        <h3>06 Oct</h3>
                    </header>
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
        })
        .catch(() => {
            console.log("something wrong happened")
        });
    
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

const form = document.querySelector("#search-form");
const input = document.querySelector("#search-form input");

form.addEventListener("submit", e => {
    e.preventDefault();
    const inputVal = input.value;

    const url = `http://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {

            const prev = document.querySelector(".prev-cards")

            const { weather,main, name, sys } = data;

            const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;

            const article = document.createElement("article");
            article.classList.add("card-md");
            const markup = `
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

            `;
            article.innerHTML = markup;
            prev.appendChild(article);

            
        })
        .catch(() => {
            console.log("something wrong happened")
        });


//   msg.textContent = "";
  form.reset();
  input.focus();

})





