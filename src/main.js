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
const contentContainer = document.querySelector('.content');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchBtn');

const loader = document.getElementById('loader');
const errorElem = document.getElementById('error');

const detailsCloseButton = document.getElementById('closeBtn');
const countryDetails = document.getElementById("countryDetails");
const countryList = document.getElementById("countryList");

const mapContainer = document.getElementById("map");

let map; // Global variable to hold the map instance
let countriesList = []; // Array to hold all countries data
let currentCountyList = []; // Array to hold the current list of countries displayed

let currentIndex = 0;
const perPage = 20;

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

function onHandleScroll() {
  if (contentContainer.scrollTop + contentContainer.clientHeight >= contentContainer.scrollHeight - 100) {
    // If not already loading and not reached end:
    if (currentIndex < countriesList.length) {
      renderCountries();
    }
  }
}

contentContainer.addEventListener('scroll', onHandleScroll);

detailsCloseButton.addEventListener('click', () => {
  countryDetails.innerHTML = ''; // Clear country details
  mapContainer.classList.add('hidden'); // Hide map
  detailsCloseButton.classList.add('hidden'); // Hide close button
  currentIndex = 0; // Reset index for next fetch
  countryList.innerHTML = ''; // Clear country list
  searchInput.value = ''; // Clear search input
  contentContainer.addEventListener('scroll', onHandleScroll); // Re-enable scroll event
  renderCountries();
});

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

    // render countries
    renderCountries();

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
  countryList.classList.add('hidden');
  contentContainer.removeEventListener('scroll', onHandleScroll);

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
    detailsCloseButton.classList.remove('hidden'); // Show close button

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
    
    updateTimezones(country.timezones);
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

function renderCountries() {
  countryList.classList.remove('hidden');

  const nextItems = countriesList.slice(currentIndex, currentIndex + perPage);
  nextItems.forEach(country => {
    const countryItem = document.createElement('div');
    countryItem.className = 'card p-10 rounded cursor-pointer flex-grow flex-shrink basis-[200px] min-w-[200px] hover:bg-gray-100';
    //countryItem.textContent = country.name.common;
    countryItem.addEventListener('click', () => {
      fetchCountryData(country.name.common);
    });
    const countryName = document.createElement('h2');
    countryName.className = 'text-l font-bold';
    countryName.textContent = country.name.common;
    countryItem.appendChild(countryName);
    
    // Create and append the flag image
    const flagImg = document.createElement('img');
    flagImg.src = country.flags.svg;
    flagImg.alt = `${country.name.common} flag`;
    flagImg.className = 'flag inline-block mr-2';
    countryItem.prepend(flagImg);
    countryList.appendChild(countryItem);
  });
  currentIndex += perPage;
}

function updateTimezones(timezones) {
    const timezoneList = document.getElementById("timezoneList");
    timezoneList.innerHTML = "";

    timezones.forEach((tz) => {
        const li = document.createElement("li");
        const localTime = getTimeUsingIntl(tz);

        li.textContent = `${tz} - ${localTime}`;
        timezoneList.appendChild(li);
    });
}

function getTimeUsingIntl(tz) {
    try {
        const options = {
            timeZone: convertToIANA(tz),
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        };
        return Intl.DateTimeFormat("en-US", options).format(new Date());
    } catch (err) {
        console.warn(`Timezone ${tz} not supported, falling back.`);
        return "Unsupported timezone";
    }
}

function convertToIANA(utcString) {
    // Basic support for known UTC formats
    if (utcString === "UTC") return "Etc/UTC";

    const match = utcString.match(/^UTC([+-]\d{2}):(\d{2})$/);
    if (match) {
        const [, hour, min] = match;
        // Convert UTC offset to Etc/GMT format (note: reverse sign for IANA)
        const offset = parseInt(hour, 10);
        const sign = offset < 0 ? "+" : "-";
        return `Etc/GMT${sign}${Math.abs(offset)}`; // IANA flips signs
    }

    return "Etc/UTC"; // fallback
}

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