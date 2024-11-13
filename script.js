const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherDetails = document.getElementById('weather-details');
const errorMsg = document.getElementById('error-msg');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temp');
const description = document.getElementById('description');
const cityName = document.getElementById('city');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');

// Using Open-Meteo API which doesn't require an API key
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
        
        // Then get weather data using coordinates
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
        );
        
        const weatherData = await weatherResponse.json();
        
        displayWeatherData(weatherData, location.name);
        
        weatherDetails.classList.remove('hidden');
        errorMsg.classList.add('hidden');
    } catch (error) {
        console.error(error);
        weatherDetails.classList.add('hidden');
        errorMsg.classList.remove('hidden');
    }
}

function getWeatherIcon(code) {
    // Weather codes mapping to icons
    const weatherCodes = {
        0: '01d', // Clear sky
        1: '02d', // Mainly clear
        2: '03d', // Partly cloudy
        3: '04d', // Overcast
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

function displayWeatherData(data, city) {
    const iconCode = getWeatherIcon(data.current.weather_code);
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    temperature.textContent = `${Math.round(data.current.temperature_2m)}°C`;
    description.textContent = getWeatherDescription(data.current.weather_code);
    cityName.textContent = city;
    humidity.textContent = `${Math.round(data.current.relative_humidity_2m)}%`;
    windSpeed.textContent = `${Math.round(data.current.wind_speed_10m * 3.6)} km/h`; // Convert m/s to km/h
}

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