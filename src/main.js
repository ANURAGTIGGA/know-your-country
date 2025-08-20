import './style.css'
//import { setupCounter } from './counter.js'
import { createFooter } from './components/Footer.js';

// document.querySelector('#app').innerHTML = `
  
// `

//setupCounter(document.querySelector('#counter'))

document.addEventListener('DOMContentLoaded', function() {
  const footerHtml = createFooter();
  document.querySelector('#footer').innerHTML = footerHtml;
});

/*
Define dom elemements
*/

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchBtn');

const loader = document.getElementById('loader');
const errorElem = document.getElementById('error');

const countryDetails = document.getElementById("countryDetails");

let map; // Global variable to hold the map instance

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



async function fetchCountryData(name) {
  loader.classList.remove('hidden');
  errorElem.classList.add('hidden');

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