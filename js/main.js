function getCity() {
   const city = document.getElementById('getCity').value;
   //getJSON('London');
   getJSON(city);
}

function getJSON(city) {

   let errorBlock = document.getElementById('getCityError');
   fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&lang=usa&appid=b86d25efa06fcc75c173ef045c593220`)

      .then(response => {
         if (response.status == 200) {
            return response.json();
         }
         if (response.status == 404) {
            throw new Error("Enter another city");
         }
         if (response.status == 400) {
            throw new Error("Empty label");
         }
         throw new Error('Sorry, something went wrong, try later');

      }).then(response => {
         if (errorBlock.innerText) {
            errorBlock.innerText = "Now it's okay";
         }
         getWeather(response);

      }).catch(err => {
         errorBlock.innerText = err.message
      });
}

function getWeather(json) {
   let all = [];
   const list = json.list;
   let id = 0;
   //get all needed data
   for (let item of list) {
      let weather = {};

      weather.clouds = item.clouds.all + '%';
      weather.temp = Math.round((item.main.temp - 273.15));
      weather.humidity = item.main.humidity + '%';
      weather.wind = Math.round(item.wind.speed) + 'm/s';
      if (item.rain) {
         weather.rain = item.rain['3h'] + 'mm';
      }
      if (item.snow) {
         weather.snow = item.snow['3h'] + 'mm';
      }

      weather.background = item.weather[0].icon;

      let date = new Date(item.dt_txt);

      weather.day = formateDate(date.getDate()) + '.' + formateDate(date.getMonth());
      weather.time = formateDate(date.getHours()) + ':' + formateDate(date.getMinutes());
      all.push(weather);

   }
   showDetailed(all[0]);

   //Seconde parametr - Block selector where to render HTML
   renderHTML(all.filter(item => item.day == all[0].day), '#dashboards');
   renderDaysHTML(all, '#daysDashboards')
}
//Show all data of item
function showDetailed(item) {
   let resultBlock = document.getElementById('weatherResult');
   let precipitation = renderPrecipitation(item);

   let layout = `
      <p class="now__day">Day: ${item.day} </p>
      <p class="now__time">Time: ${item.time} </p>
      <p class="now__temp">Temp: ${item.temp}°C</p>
       <p class="now__info info">${precipitation}</p>
      <p class="now__info info">Wind: ${item.wind}</p>
      <p class="now__info info">Humidity: ${item.humidity}</p>
      <p class="now__info info">Clouds: ${item.clouds}</p>
      <!--<img src="img/${item.background}.png" class="now__background">-->
      <hr>
   `
   resultBlock.innerHTML = layout;
}

function renderHTML(arr, selector) {

   let result = '';
   for (let i = 0; i < arr.length; i++) {
      let precipitation = renderPrecipitation(arr[i]);

      let layout =
         `<div id="dashboard" class="dashboard" data-value="${i}" >
            <p class="dashboard__day">Day: ${arr[i].day} </p>
            <p class="dashboard__time">Time: ${arr[i].time} </p>
            <p class="dashboard__info info">Temp: ${arr[i].temp}°C</p>
            <p class="dashboard__info info">${precipitation}</p>
            <img src="http://openweathermap.org/img/wn/${arr[i].background}@2x.png" class="dasboard__background">
         </div>
         <hr>
         `
      result += layout;
   }
   let element = document.querySelector(selector);
   element.innerHTML = result;

   addClick('#dashboard', arr);
}

function renderDaysHTML(arr, selector) {

   let result = ''
   try {
      //get unique days
      const days = [...new Set(arr.map(item => item.day))];
      for (let i = 0, id = i; id < arr.length; i++, id += 8) {
         let minMax = getMinMaxTemp(arr.filter(item => item.day == days[i]));
         let layout = `
            <div id="daysDashboard" class="days-dashboard" data-value="${id}" >
               <p class="days-dashboard__day">Day: ${arr[id].day} </p>           
               <p class="days-dashboard__info info">Min: ${minMax.min}°C</p>
               <p class="days-dashboard__info info">Max: ${minMax.max}°C</p>  
            </div>
            <hr>
         `
         result += layout;
      }
      let element = document.querySelector(selector);
      element.innerHTML = result;

      //Now we are able to see more info in some days
      addClick('#daysDashboard', arr);
   } catch (err) {
      console.log(err);
   }
}

function addClick(selector, json) {
   let dasboards = document.querySelectorAll(selector);
   dasboards.forEach(item => {
      item.addEventListener('click', function () {
         let id = item.getAttribute('data-value');
         showDetailed(json[id]);
         renderHTML(json.filter(obj => obj.day == json[id].day), '#dashboards')
      })
   });
}

function formateDate(item) {
   item = item.toString().split('');
   if (item.length == 1) {
      t = item[0];
      item[0] = 0;
      item[1] = t
   }
   return item.join('');
}

function renderPrecipitation(item) {
   let precipitation;

   if (item.rain) {
      precipitation = `Rain: ${item.rain}`
   } else if (item.snow) {
      precipitation = `Snow: ${item.snow}`
   } else if (item.rain && item.snow) {
      precipitation = `Snow with rain`
   } else {
      precipitation = 'No precipitation'
   }
   return precipitation;
}

function getMinMaxTemp(arr) {
   let temp = [];
   for (let obj of arr) {
      temp.push(obj.temp);
   }
   let result = {}
   result.min = Math.min(...temp);
   result.max = Math.max(...temp);

   return result
}