import './style.css'
import { createFooter } from './components/Footer.js';

document.addEventListener('DOMContentLoaded', function() {
  const footerHtml = createFooter();
  document.querySelector('#footer').innerHTML = footerHtml;
  fetchAllCountries();
});

/*
Define dom elemements
*/

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchBtn');

const loader = document.getElementById('loader');
const errorElem = document.getElementById('error');

const countryDetails = document.getElementById("countryDetails");
const countryList = document.getElementById("countryList");

const mapContainer = document.getElementById("map");

let map; // Global variable to hold the map instance
let countriesList = []; // Array to hold all countries data
let currentCountyList = []; // Array to hold the current list of countries displayed

/*
Add event listener to the search button
*/
function onClickHandler() {
  const countryName = searchInput.value.trim();
  if (countryName) {
    fetchCountryData(countryName);
  } else {
    alert('Please enter a country name');
  }
}

searchButton.addEventListener('click', onClickHandler);

/** */

async function fetchAllCountries() {
  loader.classList.remove('hidden');
  errorElem.classList.add('hidden');
  mapContainer.classList.add('hidden'); // Hide map initially

  // Clear previous country details
  countryDetails.innerHTML = '';

  // Clear previous error message
  errorElem.textContent = '';

  // Clear previous country list
  countryList.innerHTML = '';

  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    countriesList = data;
    currentCountyList = data.slice(0,10); // Initialize current list with all countries

    // Clear previous country list
    countryList.innerHTML = '';

    // Populate the country list
    currentCountyList.forEach(country => {
      const countryItem = document.createElement('div');
      countryItem.className = 'card p-10 rounded cursor-pointer flex-grow flex-shrink basis-[200px] min-w-[200px] hover:bg-gray-100';
      countryItem.textContent = country.name.common;
      countryItem.addEventListener('click', () => {
        fetchCountryData(country.name.common);
      });
      const flagImg = document.createElement('img');
      flagImg.src = country.flags.svg;
      flagImg.alt = `${country.name.common} flag`;
      flagImg.className = 'inline-block mr-2';
      countryItem.prepend(flagImg);
      countryList.appendChild(countryItem);
    });

    if (data.length === 0) {
      errorElem.classList.remove('hidden');
      errorElem.textContent = "No countries found";
    }
  } catch (error) {
    errorElem.classList.remove('hidden');
    errorElem.textContent = error.message || "Failed to load the countries";
    console.error('Error fetching country data:', error);
  } finally {
    loader.classList.add('hidden');
  }
}

async function fetchCountryData(name) {
  loader.classList.remove('hidden');
  errorElem.classList.add('hidden');
  mapContainer.classList.add('hidden'); // Show map when fetching country data

  try {
    const response = await fetch(
            `https://restcountries.com/v3.1/name/${name}?fullText=true`
        );
    if (!response.ok) {
      // Throw an error so catch block can run
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    const country = data[0];
    if (!country) {
        throw new Error(`Invalid Country Name`);
    }
    mapContainer.classList.remove('hidden'); // Show map when country data is fetched

    // Clear previous country details
    countryDetails.innerHTML = '';

    // Clear previous error message
    errorElem.textContent = '';

    const languages = country.languages
        ? Object.values(country.languages).join(",")
        : "N/A";

    countryDetails.innerHTML = `
            <div class="p-4 border rounded shadow">
                <img src="${country.flags.svg}" alt="flag" class="w-32 mb-2" />
                <h2 class="text-xl font-bold">${country.name.common}</h2>
                <p><strong>Capital:</strong> ${country.capital}</p>
                <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                <p><strong>Languages:</strong> ${languages}</p>
                <div class="mb-4">
                    <h2 class="text-xl font-semibold mb-2">Local Times</h2>
                    <ul id="timezoneList" class="list-disc ml-6"></ul>
                </div>
            </div>
        `;
    
    drawMap(country.latlng, country.name.common);
  } catch (error) {
    errorElem.classList.remove('hidden');
    errorElem.textContent =
            error.message || "Failed to load the country information";
    console.error('Error fetching country data:', error);
    mapContainer.classList.add('hidden'); // Hide map if there's an error
  } finally {
    loader.classList.add('hidden');
  }
}

//fetchCountryData('India'); // Example usage, replace 'India' with any country name


function drawMap(latlang, name) {
    const [lat, lng] = latlang;

    if (!map) {
        map = L.map("map").setView([lat, lng], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
            map
        );
    } else {
        map.setView([lat, lng], 5);
    }

    L.marker([lat, lng]).addTo(map).bindPopup(name).openPopup();
}