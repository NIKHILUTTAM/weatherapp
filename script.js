// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const weatherDetails = document.getElementById('weather-details');
const errorMsg = document.getElementById('error-msg');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temp');
const feelsLike = document.getElementById('feels-like');
const description = document.getElementById('description');
const cityName = document.getElementById('city');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const currentDate = document.getElementById('current-date');
const currentTime = document.getElementById('current-time');
const forecastContainer = document.getElementById('forecast-container');
const weatherAlert = document.getElementById('weather-alert');
const alertMessage = document.getElementById('alert-message');
const celsiusBtn = document.getElementById('celsius');
const fahrenheitBtn = document.getElementById('fahrenheit');

// State
let currentUnit = 'celsius';
let currentWeatherData = null;

// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = now.toLocaleDateString(undefined, options);
    currentTime.textContent = now.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Update datetime every minute
setInterval(updateDateTime, 60000);
updateDateTime();

// Temperature conversion functions
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
}

// Get user's current location
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                showError("Unable to retrieve your location");
            }
        );
    } else {
        showError("Geolocation is not supported by your browser");
    }
});

// Unit toggle handlers
celsiusBtn.addEventListener('click', () => {
    if (currentUnit !== 'celsius') {
        currentUnit = 'celsius';
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
        if (currentWeatherData) {
            displayWeatherData(currentWeatherData);
        }
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (currentUnit !== 'fahrenheit') {
        currentUnit = 'fahrenheit';
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
        if (currentWeatherData) {
            displayWeatherData(currentWeatherData);
        }
    }
});

// Set dynamic background based on weather and time
function setDynamicBackground(weatherCode, isDay) {
    const body = document.body;
    body.classList.remove('night', 'cloudy', 'rainy');
    
    if (!isDay) {
        body.classList.add('night');
    } else if (weatherCode >= 51 && weatherCode <= 65) {
        body.classList.add('rainy');
    } else if (weatherCode >= 1 && weatherCode <= 3) {
        body.classList.add('cloudy');
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,visibility` +
            `&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=6`
        );
        
        const geoResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );
        
        const weatherData = await weatherResponse.json();
        const geoData = await geoResponse.json();
        
        currentWeatherData = {
            ...weatherData,
            city: geoData.city || geoData.locality || 'Unknown Location'
        };
        
        displayWeatherData(currentWeatherData);
        
        weatherDetails.classList.remove('hidden');
        errorMsg.classList.add('hidden');
    } catch (error) {
        showError("Error fetching weather data");
    }
}

async function fetchWeatherData(city) {
    try {
        // First, get coordinates for the city
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
        );
        
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found');
        }

        const location = geoData.results[0];
        await fetchWeatherByCoords(location.latitude, location.longitude);
        
    } catch (error) {
        showError(error.message);
    }
}

function getWeatherIcon(code, isDay = true) {
    const weatherCodes = {
        0: isDay ? '01d' : '01n', // Clear sky
        1: isDay ? '02d' : '02n', // Mainly clear
        2: isDay ? '03d' : '03n', // Partly cloudy
        3: isDay ? '04d' : '04n', // Overcast
        45: '50d', // Foggy
        48: '50d', // Depositing rime fog
        51: '09d', // Light drizzle
        53: '09d', // Moderate drizzle
        55: '09d', // Dense drizzle
        61: '10d', // Slight rain
        63: '10d', // Moderate rain
        65: '10d', // Heavy rain
        71: '13d', // Slight snow fall
        73: '13d', // Moderate snow fall
        75: '13d', // Heavy snow fall
        80: '09d', // Slight rain showers
        81: '09d', // Moderate rain showers
        82: '09d', // Violent rain showers
        85: '13d', // Slight snow showers
        86: '13d', // Heavy snow showers
        95: '11d', // Thunderstorm
    };
    
    return weatherCodes[code] || '01d';
}

function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm'
    };
    
    return descriptions[code] || 'Unknown';
}

function formatTemperature(temp) {
    if (currentUnit === 'fahrenheit') {
        return `${Math.round(celsiusToFahrenheit(temp))}°F`;
    }
    return `${Math.round(temp)}°C`;
}

function displayWeatherData(data) {
    const isDay = new Date().getHours() >= 6 && new Date().getHours() < 18;
    
    // Set weather icon and background
    const iconCode = getWeatherIcon(data.current.weather_code, isDay);
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    setDynamicBackground(data.current.weather_code, isDay);
    
    // Display current weather
    temperature.textContent = formatTemperature(data.current.temperature_2m);
    feelsLike.textContent = `Feels like: ${formatTemperature(data.current.temperature_2m)}`;
    description.textContent = getWeatherDescription(data.current.weather_code);
    cityName.textContent = data.city;
    humidity.textContent = `${Math.round(data.current.relative_humidity_2m)}%`;
    windSpeed.textContent = `${Math.round(data.current.wind_speed_10m * 3.6)} km/h`;
    pressure.textContent = `${Math.round(data.current.pressure_msl)} hPa`;
    visibility.textContent = `${(data.current.visibility / 1000).toFixed(1)} km`;

    // Display 5-day forecast
    displayForecast(data.daily);

    // Check for severe weather conditions
    checkWeatherAlerts(data.current.weather_code);
}

function displayForecast(dailyData) {
    forecastContainer.innerHTML = '';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 1; i < 6; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        const iconCode = getWeatherIcon(dailyData.weather_code[i], true);
        
        forecastItem.innerHTML = `
            <div class="day">${days[date.getDay()]}</div>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="weather icon">
            <div class="temp-high">${formatTemperature(dailyData.temperature_2m_max[i])}</div>
            <div class="temp-low">${formatTemperature(dailyData.temperature_2m_min[i])}</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    }
}

function checkWeatherAlerts(weatherCode) {
    let alert = '';
    
    if (weatherCode >= 95) {
        alert = 'Severe thunderstorm warning! Take necessary precautions.';
    } else if (weatherCode >= 71 && weatherCode <= 77) {
        alert = 'Heavy snow warning! Drive carefully and stay warm.';
    } else if (weatherCode >= 65) {
        alert = 'Heavy rain warning! Be prepared for potential flooding.';
    }
    
    if (alert) {
        alertMessage.textContent = alert;
        weatherAlert.classList.remove('hidden');
    } else {
        weatherAlert.classList.add('hidden');
    }
}

function showError(message) {
    errorMsg.querySelector('h3').textContent = message;
    weatherDetails.classList.add('hidden');
    errorMsg.classList.remove('hidden');
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
        }
    }
});

// Initialize with user's location if possible
document.addEventListener('DOMContentLoaded', () => {
    locationBtn.click();
});