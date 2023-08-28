$(document).ready(function () {
  let currentCityNameEl = $("<h3>").addClass("city-name");
  let currentDateEl = $("<p>").addClass("current-date");
  let currentTempEl = $("<p>").addClass("current-temp");
  let currentHumidityEl = $("<p>").addClass("current-humidity");
  let currentWindspeedEl = $("<p>").addClass("current-wind-speed");
  let futureForecastEl = $("#forecast");

  let storageCityArray = [];
  let searchCity;
  let APIKey = "35e3c2e095be8d61464a65867412dbf5"; // Replace with your API key

  function validateSearchInput() {
    searchCity = $("#search-input").val().trim();
    if (searchCity === "") {
      alert("Please enter a city name");
    } else {
      return searchCity;
    }
  }

  function storage(searchCity) {
    searchCity = $("#search-input").val().trim();
    if (storageCityArray.includes(searchCity)) {
      return;
    } else {
      storageCityArray.push(searchCity);
      localStorage.setItem("searches", JSON.stringify(storageCityArray));
    }
    renderHistory(searchCity);
  }

  function renderHistory(searchCity) {
    let listEl = $("<li>")
      .addClass("list-group-item")
      .attr("data-value", searchCity.toUpperCase())
      .text(searchCity.toUpperCase());
    $("#history").prepend(listEl);
  }

  function weatherQuery(cityName) {
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&APPID=${APIKey}`;

    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      currentCityNameEl.text(`Current City: ${response.name}`);
      let dateRes = response.dt;
      let date = new Date(dateRes * 1000).toLocaleDateString();
      currentDateEl.text(`Current Date: ${date}`);
      let temp = (response.main.temp - 273.15) * 1.8 + 32;
      currentTempEl.text(`Current Temperature: ${temp.toFixed(1)}°F`);
      let humidRes = response.main.humidity + "%";
      currentHumidityEl.text(`Current Humidity: ${humidRes}`);
      let windSp = response.wind.speed;
      let windSpeed = (windSp * 2.237).toFixed(1);
      currentWindspeedEl.text(`Current Wind Speed: ${windSpeed} mph`);

      $("#today").empty();
      $("#today").append(currentCityNameEl);
      $("#today").append(currentDateEl);
      $("#today").append(currentTempEl);
      $("#today").append(currentHumidityEl);
      $("#today").append(currentWindspeedEl);
    });
  }

  //   function forecast(cityName) {
  //     // ... (your existing forecast function)
  //   }

  function forecast(cityName) {
    let forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${APIKey}`;

    $.ajax({
      url: forecastURL,
      method: "GET",
    }).then(function (response) {
      futureForecastEl.empty(); // Clear any previous forecast data

      for (let i = 0; i < response.list.length; i += 8) {
        let forecastDate = response.list[i].dt_txt;
        let forecastIcon = response.list[i].weather[0].icon;
        let forecastTempK = response.list[i].main.temp;
        let forecastTempF = ((forecastTempK - 273.15) * 1.8 + 32).toFixed(2);
        let forecastHumidity = response.list[i].main.humidity;

        let futureDayEl = $("<div>").addClass("future-day");
        let dateEl = $("<p>").text(moment(forecastDate).format("MM/DD/YYYY"));
        let iconEl = $("<img>")
          .addClass("future-icon")
          .attr("src", `https://openweathermap.org/img/wn/${forecastIcon}.png`);
        let tempEl = $("<p>").html(`Temp: ${forecastTempF} °F`);
        let humidityEl = $("<p>").text(`Humidity: ${forecastHumidity}%`);

        futureDayEl.append(dateEl, iconEl, tempEl, humidityEl);
        futureForecastEl.append(futureDayEl);
      }
    });
  }

  function attachHistoryClickEvent() {
    $(".list-group-item").on("click", function () {
      const selectedCity = $(this).attr("data-value");
      renderWeatherData(selectedCity);
    });
  }

  function renderWeatherData(cityName) {
    weatherQuery(cityName);
    forecast(cityName);
  }

  $("#search-form").on("submit", function (event) {
    event.preventDefault();
    validateSearchInput();
    storage(searchCity);
    renderWeatherData(searchCity);
    attachHistoryClickEvent();
  });

  $(window).on("load", function () {
    let lastSearchCity = JSON.parse(localStorage.getItem("searches"));
    if (lastSearchCity !== null) {
      renderHistory(lastSearchCity[0]);
      searchCity = lastSearchCity[0];
      renderWeatherData(searchCity);
      attachHistoryClickEvent();
    }
  });
});
