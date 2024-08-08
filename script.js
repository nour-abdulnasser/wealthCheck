// Global clientDetails object
let clientDetails = {
  name: "",
  assets: {
    realEstate: [],
    privateEquity: [],
    nicheAssets: [],
    financialAssetsWithOtherAdvisors: [],
  },
  currentAssetType: "", // storing temp data here? interesting idea
  currentSubAssetType: "",
};

// // for demo only
// let subSubTypes = {
//   realEstate: {
//     residential: ["residential property for rent", "residential housing"],
//     commercial: ["commercial property for rent", "office"],
//     industrial: ["factories", "warehouses"],
//     land: ["agricultural land"],
//   },
//   privateEquity: {
//     privateEquityFund: [
//       {
//         nameOfFund: "",
//         ISIN: 0,
//         CUSIP: 0,
//         ID: 0,
//         amountOfShares: 0,
//         valueOfInvestment: 0,
//         buyPricePerShare: 0,
//       },
//     ],
//     personalInvestment: [
//       {
//         nameOfCompany: "",
//         amountOfShares: 0,
//         valueOfInvestment: 0,
//         buyPricePerShare: 0,
//       },
//     ],
//     ownCompany: [
//       {
//         nameOfCompany: "",
//         amountOfShares: 0, // ownership %
//         valueOfInvestment: 0,
//         buyPricePerShare: 0,
//       },
//     ],
//   },
// };

function loadClientDetails() {
  const sessionData = sessionStorage.getItem("clientDetails");
  const localData = localStorage.getItem("clientDetails");

  if (sessionData) {
    clientDetails = JSON.parse(sessionData);
  } else if (localData) {
    clientDetails = JSON.parse(localData);
    sessionStorage.setItem("clientDetails", localData);
  }
  console.log("Loaded client details:", clientDetails);
}

function saveClientDetails() {
  localStorage.setItem("clientDetails", JSON.stringify(clientDetails));
  sessionStorage.setItem("clientDetails", JSON.stringify(clientDetails));
  console.log("Saved client details:", clientDetails);
}

function clearAllLocalStorage() {
  localStorage.clear();
  sessionStorage.clear();
  console.log("All storage data has been cleared");

  clientDetails = {
    name: "",
    assets: {
      realEstate: [],
      privateEquity: [],
      nicheAssets: [],
      financialAssetsWithOtherAdvisors: [],
    },
    currentAssetType: "",
    currentSubAssetType: "",
  };

  console.log("clientDetails reset to initial state:", clientDetails);
}

async function loadCountries() {
  const response = await fetch("https://restcountries.com/v3.1/all");
  const data = await response.json();
  return data.sort((a, b) => a.name.common.localeCompare(b.name.common));
}

async function loadCities(country) {
  const response = await fetch(
    "https://countriesnow.space/api/v0.1/countries/cities",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        country: country,
      }),
    }
  );
  const data = await response.json();
  return data;
}

function populateDropdown(items, selectElement) {
  // selectElement.innerHTML = "";
  // nts about api: each country has name then common, each city is just a string
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item.name ? item.name.common : item;
    selectElement.appendChild(option);
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function cca2ToCommon(cca2) {
  const countries = await loadCountries();
  const country = countries.find((country) => country.cca2 == cca2);
  return country.name.common;
}

// each row given id?
function addRow() {
  const table = document
    .getElementById("dataTable")
    .getElementsByTagName("tbody")[0];
  const newRow = table.insertRow(table.rows.length);

  for (let i = 0; i < 4; i++) {
    const cell = newRow.insertCell(i);
    if (i == 1 || i == 2) {
      const input = document.createElement("input");
      if (i == 1) {
        input.classList.add("ie-concept-input");
      } else if (i == 2) {
        input.classList.add("ie-amount-input");
      }
      input.type = i === 2 ? "number" : "text";
      input.placeholder = i == 1 ? "Concept" : "Amount";
      cell.appendChild(input);
    } else if (i == 0) {
      const selectEl = document.createElement("select");
      selectEl.classList.add("income-expense-select");

      const defaultOption = document.createElement("option");
      defaultOption.disabled = true;
      defaultOption.textContent = "Please select type";
      defaultOption.selected = true;
      selectEl.appendChild(defaultOption);

      const options = ["Income", "Expense"];
      populateDropdown(options, selectEl);
      cell.appendChild(selectEl);
    } else {
      const selectEl = document.createElement("select");
      selectEl.classList.add("ie-frequency-select");

      const defaultOption = document.createElement("option");
      defaultOption.disabled = true;
      defaultOption.textContent = "Please select frequency";
      defaultOption.selected = true;
      selectEl.appendChild(defaultOption);

      const options = ["Monthly", "Annual"];
      populateDropdown(options, selectEl);
      cell.appendChild(selectEl);
    }
  }

  const rows = document.querySelectorAll("#dataTable tbody tr");
  console.log(rows);
}

// grabbing values from the rows
function getTableData() {
  const rows = document.querySelectorAll("#dataTable tbody tr");

  const data = [];
  rows.forEach((row) => {
    const typeSelect = row.querySelector(".income-expense-select");
    const conceptInput = row.querySelector(".ie-concept-input");
    const amountInput = row.querySelector(".ie-amount-input");
    const frequencySelect = row.querySelector(".ie-frequency-select");

    const type = typeSelect ? typeSelect.value : null;
    const concept = conceptInput ? conceptInput.value : null;
    const amount = amountInput ? parseFloat(amountInput.value) : NaN;
    const frequency = frequencySelect ? frequencySelect.value : null;

    // if (type && concept && !isNaN(amount) && frequency) {
      data.push({
        type: type,
        concept: concept,
        amount: amount,
        frequency: frequency,
      });
    // }
  });

  console.log(data);
  return data;
}

loadClientDetails();

document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop();
  console.log("Current page:", currentPage);

  switch (currentPage) {
    case "index.html":
    case "":
      handleIndexPage();
      break;
    case "name.html":
      handleNamePage();
      break;
    case "main-menu.html":
      handleMainMenuPage();
      break;
    case "asset-types.html":
      handleAssetTypesPage();
      break;
    case "real-estate-type.html":
      handleRealEstateTypePage();
      break;
    case "private-equity-types.html":
      handlePrivateEquityTypePage();
      break;
    case "niche-types.html":
      handleNicheAssetsTypePage();
      break;
    case "real-estate-form.html":
    case "private-equity-form.html":
    case "niche-assets-form.html":
    case "financial-assets-form.html":
      handleAssetFormPage();
      break;
    case "review-screen.html":
      handleReviewPage();
      break;
    case "add-another-asset-screen.html":
      handleAddAnotherAssetPage();
      break;
    default:
      console.log("Unhandled page:", currentPage);
  }
});

function handleIndexPage() {
  const comenzarBtn = document.querySelector(".fancy-button");
  if (comenzarBtn) {
    comenzarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "./name.html";
    });
  }

  const clearDataBtn = document.getElementById("clear-data-btn");
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to clear all data? This action cannot be undone."
        )
      ) {
        clearAllLocalStorage();
        alert("All data has been cleared.");
        window.location.reload();
      }
    });
  }
}

// we want to navigate to main menu after name
function handleNamePage() {
  const nameInput = document.getElementById("name-input");
  const nextBtn = document.getElementById("name-next-btn");

  if (nameInput && nextBtn) {
    nameInput.value = clientDetails.name || "";

    nameInput.addEventListener("input", (e) => {
      nextBtn.disabled = e.target.value.trim() === "";
      clientDetails.name = e.target.value.trim();
      saveClientDetails();
    });

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (clientDetails.name) {
        window.location.href = "./main-menu.html";
      }
    });
  }
}

// after name. choices: my results, portfolio, etc
function handleMainMenuPage() {}

// if user chooses assets and liability from main menu, asset type page is where they land
function handleAssetTypesPage() {
  const assetTypeButtons = document.querySelectorAll(
    "#asset-type-inner-container .fancy-button"
  );
  assetTypeButtons.forEach((button) => {

    button.addEventListener("click", (e) => {
      e.preventDefault();
      clientDetails.currentAssetType = button.id.replace("-btn", "");
      
      saveClientDetails();
      switch (clientDetails.currentAssetType) {
        case "realEstate":
          console.log(clientDetails.currentAssetType);
          window.location.href = "./real-estate-type.html";
          break;
        case "privateEquity":
          window.location.href = "./private-equity-types.html";
          break;
        case "nicheAssets":
          window.location.href = "./niche-types.html";
          break;
        case "financialAssetsWithOtherAdvisors":
          window.location.href = "./financial-assets-form.html";
          break;
      }
    });
  });
}

function handleRealEstateTypePage() {
  const subAssetButtons = document.querySelectorAll(
    ".inner-real-estate .fancy-button"
  );
  subAssetButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      clientDetails.currentSubAssetType = btn.id.replace("-btn", "");
      saveClientDetails();
      window.location.href = "./real-estate-form.html";
    });
  });
}

function handlePrivateEquityTypePage() {
  const subAssetButtons = document.querySelectorAll(
    ".inner-private-equity .fancy-button"
  );
  subAssetButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      clientDetails.currentSubAssetType = btn.id.replace("-btn", "");
      saveClientDetails();
      window.location.href = "./private-equity-form.html";
    });
  });
}

function handleNicheAssetsTypePage() {
  const subAssetButtons = document.querySelectorAll(
    ".inner-niche-assets .fancy-button"
  );
  subAssetButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      clientDetails.currentSubAssetType = btn.id.replace("-btn", "");
      saveClientDetails();
      window.location.href = "./niche-assets-form.html";
    });
  });
}

function handleAssetFormPage() {
  const nextAssetBtn = document.getElementById("asset-details-next-btn");
  const countrySelect = document.getElementById("countries");
  const citySelect = document.getElementById("cities");
  let selectedCountry = "";

  loadCountries()
    .then((countries) => {
      populateDropdown(countries, countrySelect);
    })
    .catch((error) => console.error("Error loading countries:", error));

  countrySelect.addEventListener("change", async () => {
    selectedCountry = countrySelect.options[countrySelect.selectedIndex].text;
    loadCities(selectedCountry)
      .then((cities) => {
        populateDropdown(cities.data, citySelect);
      })
      .catch((error) => console.error("Error loading cities:", error));
  });

  document.getElementById("ieCheck").addEventListener("change", function () {
    var table = document.getElementById("income-expense-table");
    if (this.checked) {
      table.style.display = "block";
    } else {
      table.style.display = "none";
    }
  });

  nextAssetBtn.addEventListener("click", function (e) {
    e.preventDefault();
    let newAsset = {
      // need to add more deets: income, expense, subtypes
      type: clientDetails.currentSubAssetType,
      name: document.querySelector(".asset-name-input").value,
      country: selectedCountry,
      city: citySelect.value,
      assetCategory: document.getElementById("subCategories").value,
      address: document.querySelector(".address-input").value,
      value: document.querySelector(".value-input").value,
      income_expense: getTableData() || "NA",
    };
    

    if (!clientDetails.assets[clientDetails.currentAssetType]) {
      clientDetails.assets[clientDetails.currentAssetType] = [];
    }
    clientDetails.assets[clientDetails.currentAssetType].push(newAsset);

    saveClientDetails();
    console.log("Added new asset:", newAsset);
    console.log("Updated clientDetails:", clientDetails);
    window.location.href = "./review-screen.html";
  });
}

async function handleReviewPage() {
  const editBtn = document.getElementById("edit-details-btn");
  const confirmBtn = document.getElementById("confirm-details-btn");
  const editForm = document.getElementById("edit-form");

  // Populate review fields
  const currentAsset =
    clientDetails.assets[clientDetails.currentAssetType][
      clientDetails.assets[clientDetails.currentAssetType].length - 1
    ];
  document.getElementById("edit-client-name").value = clientDetails.name;
  document.getElementById("edit-type").value =
    currentAsset.type || "unspecified";
  document.getElementById("edit-asset-name").value = currentAsset.name;
  document.getElementById("edit-address").value = currentAsset.address;
  document.getElementById("edit-country").value = currentAsset.country;
  document.getElementById("edit-city").value = currentAsset.city;
  document.getElementById("edit-value").value = currentAsset.value;


  // Initially disable all form fields
  document
    .querySelectorAll("#edit-form input, #edit-form select")
    .forEach((el) => (el.disabled = true));

  editBtn.addEventListener("click", function () {
    // Enable editing of fields
    document
      .querySelectorAll("#edit-form input, #edit-form select")
      .forEach((el) => (el.disabled = false));
    editBtn.style.display = "none";
    confirmBtn.style.display = "inline-block";
  });

  confirmBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const editedAsset = {
      type: document.getElementById("edit-type").value,
      name: document.getElementById("edit-asset-name").value.toUpperCase(),
      address: capitalizeFirstLetter(
        document.getElementById("edit-address").value
      ),
      country: capitalizeFirstLetter(
        document.getElementById("edit-country").value
      ),
      city: capitalizeFirstLetter(document.getElementById("edit-city").value),
      value: document.getElementById("edit-value").value,
    };

    clientDetails.assets[clientDetails.currentAssetType][
      clientDetails.assets[clientDetails.currentAssetType].length - 1
    ] = editedAsset;
    saveClientDetails();
    console.log("Updated asset:", editedAsset);
    console.log("Updated clientDetails:", clientDetails);

    // Navigate to add-another-asset screen
    window.location.href = "./add-another-asset-screen.html";
  });
}

function handleAddAnotherAssetPage() {
  console.log("Current clientDetails:", clientDetails);
  const sameAssetBtn = document.getElementById("add-same-asset-btn");
  const differentAssetBtn = document.getElementById("add-different-asset-btn");
  const reviewAllBtn = document.getElementById("review-all-btn");

  sameAssetBtn.addEventListener("click", function (e) {
    e.preventDefault();
    // Navigate to the appropriate sub-asset screen based on current asset type
    console.log("Current asset type:", clientDetails.currentAssetType);
    switch (clientDetails.currentAssetType) {
      case "realEstate":
        window.location.href = "./real-estate-type.html";
        break;
      case "privateEquity":
        window.location.href = "./private-equity-types.html";
        break;
      case "nicheAssets":
        window.location.href = "./niche-types.html";
        break;
      case "financialAssetsWithOtherAdvisors":
        console.log(
          "Financial assets with other advisors - Not implemented yet"
        );
        // For now, this will do nothing
        break;
      default:
        console.log("Unknown asset type:", clientDetails.currentAssetType);
    }
  });

  differentAssetBtn.addEventListener("click", function (e) {
    e.preventDefault();
    clientDetails.currentAssetType = "";
    clientDetails.currentSubAssetType = "";
    saveClientDetails();
    window.location.href = "./asset-types.html";
  });

  reviewAllBtn.addEventListener("click", function (e) {
    e.preventDefault();
    console.log("Review all assets:", clientDetails);
    // Implement review all functionality here when needed
  });
}

// You can add any additional utility functions or global event listeners here if needed

// End of script


// clearAllLocalStorage()