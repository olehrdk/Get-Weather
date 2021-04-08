function getCity() {
   const city = document.getElementById('getCity').value;
   //checkCity('Brody');
   checkCity(city);
}

function checkCity(city) {

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
   const list = json.list.filter((item, index) => index <= 5);
   //console.log(list);

   for (let item of list) {
      let weather = {};

      weather.clouds = item.clouds.all + '%';
      weather.temp = Math.round((item.main.temp - 273.15)) + '°C';
      weather.humidity = item.main.humidity + '%';
      weather.wind = Math.round(item.wind.speed) + 'm/s';
      if (item.rain) {
         weather.rain = item.rain['3h'] + 'mm';
      }
      if (item.snow) {
         weather.snow = item.snow['3h'] + 'mm';
      }

      weather.background = item.weather[0].icon + '.png';

      let date = new Date(item.dt_txt);

      weather.day = formateDate(date.getDate()) + '.' + formateDate(date.getMonth());
      weather.time = formateDate(date.getHours()) + ':' + formateDate(date.getMinutes());
      all.push(weather);
   }
   showDetailed(all[0]);
   renderHTML(all);
}

function showDetailed(item) {
   let resultBlock = document.getElementById('weatherResult');
   resultBlock.innerText = JSON.stringify(item, null, 2);
   // resultBlock.innerText = all.map(item => JSON.stringify(item, null, 2))
}

function renderHTML(arr) {
   console.log(arr)
   let dashboardsBlock = document.getElementById('dashboards');
   for (let i = 0; i < arr.length; i++) {

      let precipitation;
      if (arr[i].rain) {
         precipitation = `<p>Rain: ${arr[i].rain}</p>`
      } else if (arr[i].snow) {
         precipitation = `<p>Snow: ${arr[i].snow}</p>`
      } else if (arr[i].rain && arr[i].snow) {
         precipitation = `<p>Snow with rain </p>`
      } else {
         precipitation = '<p>Without precipiation</p>'
      }

      let layout =
         `<div id="dashboard" class="dasboard" data-value="${i}" >
            <p>Day: ${arr[i].day} </p>
            <p>Time: ${arr[i].time} </p>
            <p>Temp: ${arr[i].temp}</p>
            ${precipitation}
            <!--<img src="${arr[i].background}" class="dasboard__background">-->
         </div>
         <hr>
         `
      dashboardsBlock.innerHTML += layout;
   }
   let dasboards = document.querySelectorAll('#dashboard');

   dasboards.forEach(item => {


      item.addEventListener('click', function () {
         let id = item.getAttribute('data-value');
         showDetailed(arr[id]);
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