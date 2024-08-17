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

let countriesArr = [];
let citiesArr = [];
let selectedCountry = "";

async function loadCountries() {
  const response = await fetch("https://restcountries.com/v3.1/all");
  const data = await response.json();
  return data.sort((a, b) => a.name.common.localeCompare(b.name.common));
}

// async function loadCities(country) {
//   const response = await fetch(
//     "https://countriesnow.space/api/v0.1/countries/cities",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         country: country,
//       }),
//     }
//   );
//   const data = await response.json();
//   return data.data;
// }

// for cities and countries
function populateDropdown(
  items,
  listElement,
  searchInputId,
  dropdownButtonId,
  isCountry = true
) {
  listElement.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.classList.add("dropdown-item");
    const itemName = isCountry ? item.name.common : item;
    a.textContent = itemName;
    a.onclick = () => {
      document.getElementById(dropdownButtonId).textContent = itemName;
      // if (isCountry) {
      //   selectedCountry = itemName;

      //   updateCities();
      // }
    };
    li.appendChild(a);
    listElement.appendChild(li);
  });

  const searchInput = document.getElementById(searchInputId);
  searchInput.oninput = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const listItems = listElement.querySelectorAll("li");
    listItems.forEach((li) => {
      const text = li.textContent.toLowerCase();
      li.style.display = text.includes(searchTerm) ? "" : "none";
    });
  };
}

// for monthly vs annual
function populateSelect(items, selectElement) {
  const defaultOption = selectElement.firstElementChild;
  selectElement.innerHTML = "";
  if (defaultOption) {
    selectElement.appendChild(defaultOption);
    selectElement.firstElementChild.disabled = true;
    selectElement.firstElementChild.selected = true;
  }
  // nts about api: each country has name then common, each city is just a string
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item.name ? item.name.common : item;
    selectElement.appendChild(option);
  });
}

// async function updateCities() {
//   if (selectedCountry) {
//     citiesArr = await loadCities(selectedCountry);
//     document.getElementById("cityDropdown").textContent = "Select City";
//     populateDropdown(
//       citiesArr,
//       document.getElementById("cityList"),
//       "citySearch",
//       "cityDropdown",
//       false
//     );
//     document.querySelectorAll("#cityList li a").forEach((cityItem) => {
//       cityItem.addEventListener("click", (e) => {
//         console.log("from cityyyyyyyyyy", e.target.innerText);
//       });
//     });
//   }
// }

async function initDropdown() {
  countriesArr = await loadCountries();
  populateDropdown(
    countriesArr,
    document.getElementById("countryList"),
    "countrySearch",
    "countryDropdown"
  );
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function cca2ToCommon(cca2) {
  const countries = await loadCountries();
  const country = countries.find((country) => country.cca2 == cca2);
  return country.name.common;
}

// // manually creating elements - delete action not included
// function addRow(assetType) {
//   const table = document
//     .getElementById(`dataTable-${assetType}`)
//     .getElementsByTagName("tbody")[0];
//   const newRow = table.insertRow(table.rows.length);

//   for (let i = 0; i < 5; i++) {
//     // Adjusted loop to include an extra cell for delete button
//     const cell = newRow.insertCell(i);
//     if (i == 1 || i == 2) {
//       const input = document.createElement("input");
//       if (i == 1) {
//         input.classList.add("ie-concept-input");
//       } else if (i == 2) {
//         input.classList.add("ie-amount-input");
//       }
//       input.type = i === 2 ? "number" : "text";
//       input.placeholder = i == 1 ? "Concept" : "Amount";
//       cell.appendChild(input);
//     } else if (i == 0) {
//       const selectEl = document.createElement("select");
//       selectEl.classList.add("income-expense-select");

//       const defaultOption = document.createElement("option");
//       defaultOption.disabled = true;
//       defaultOption.textContent = "Please select type";
//       defaultOption.selected = true;
//       selectEl.appendChild(defaultOption);

//       const options = ["Income", "Expense"];
//       populateSelect(options, selectEl);
//       cell.appendChild(selectEl);
//     } else if (i == 3) {
//       const selectEl = document.createElement("select");
//       selectEl.classList.add("ie-frequency-select");

//       const defaultOption = document.createElement("option");
//       defaultOption.disabled = true;
//       defaultOption.textContent = "Please select frequency";
//       defaultOption.selected = true;
//       selectEl.appendChild(defaultOption);

//       const options = ["Monthly", "Annual"];
//       populateSelect(options, selectEl);
//       cell.appendChild(selectEl);
//     } else {
//       const deleteBtn = document.createElement("button");
//       deleteBtn.textContent = "Delete";
//       deleteBtn.type = "button";
//       deleteBtn.classList.add("delete-row-btn");
//       deleteBtn.onclick = function () {
//         deleteRow(this);
//       };
//       cell.appendChild(deleteBtn);
//     }
//   }

//   const rows = document.querySelectorAll("#dataTable tbody tr");
// }

// function deleteRow(btn) {
//   const row = btn.closest("tr"); // Find the closest row to the clicked button
//   row.parentNode.removeChild(row); // Remove the row from the table
// }

function addRow(assetType) {
  
  const rowTemplate = document.querySelector(
    `#dataTable-${assetType} tbody tr:last-child`
  );

  if (rowTemplate) {
    const newRow = rowTemplate.cloneNode(true); // Clone the last row

    // Clear the values of the cloned row (optional)
    const inputs = newRow.querySelectorAll('input, select');
    inputs.forEach(input => {
      if (input.tagName === 'SELECT') {
        input.selectedIndex = 0; // Reset the select dropdown
      } else {
        input.value = ''; // Clear the input field
      }
    });

    // Append the new row to the table body
    document
      .querySelector(`#dataTable-${assetType} tbody`)
      .appendChild(newRow);
  }
}

function deleteRow(btn, assetType) {
  const tableBody = document.querySelector(`#dataTable-${assetType} tbody`);
  const rows = tableBody.querySelectorAll("tr");

  if (rows.length > 1) {
    const row = btn.closest("tr"); // Find the closest row to the clicked button
    row.parentNode.removeChild(row); // Remove the row from the table
  }
}


// function getTableData(assetType) {
//   const rows = document.querySelectorAll(`#dataTable-${assetType} tbody tr`);

//   const data = [];
//   rows.forEach((row) => {
//     const typeSelect = row.querySelector(".income-expense-select");
//     const conceptInput = row.querySelector(".ie-concept-input");
//     const amountInput = row.querySelector(".ie-amount-input");
//     const frequencySelect = row.querySelector(".ie-frequency-select");

//     const type = typeSelect ? typeSelect.value : null;
//     const concept = conceptInput ? conceptInput.value : null;
//     const amount = amountInput ? parseFloat(amountInput.value) : NaN;
//     const frequency = frequencySelect ? frequencySelect.value : null;

//     data.push({
//       type: type,
//       concept: concept,
//       amount: amount,
//       frequency: frequency,
//     });
//   });

//   console.log(data);
//   return data;
// }

function getTableData(assetType) {
  const rows = document.querySelectorAll(`#dataTable-${assetType} tbody tr`);

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

    // Only push if there is valid data
    if (type && concept && !isNaN(amount) && frequency) {
      data.push({
        type: type,
        concept: concept,
        amount: amount,
        frequency: frequency,
      });
    }
  });

  return data;
}

function populateSelect(options, selectElement) {
  options.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText;
    option.textContent = optionText;
    selectElement.appendChild(option);
  });
}

// function togglePopup() {
//   const overlay = document.getElementById("popupOverlay");
//   overlay.classList.toggle("show");
// }

function togglePopup(storeData = true) {
  const overlay = document.getElementById("popupOverlay");

  if (storeData) {
    // Collect the table data before closing the popup
    const incomeExpenseData = getTableData("re");
    document.querySelector(".income-expense-data").value = JSON.stringify(incomeExpenseData);
  }

  overlay.classList.toggle("show");
}

function nevermind() {
  togglePopup(false); // Close the popup without storing data
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
    case "niche-assets-type.html":
      handleNicheAssetTypePage();
      break;
    case "real-estate-form.html":
      handleRealEstateFormPage();
      break;
    case "private-equity-form.html":
      handlePrivateEquityFormPage();
      break;
    case "niche-asset-form.html":
      handleNicheAssetFormPage()
      break;
    case "financial-assets-form.html":
      handleFinancialAssetsFormPage();
      break;
    case "review-screen.html":
      handleReviewPage();
      break;
    case "private-equity-review-screen.html":
      handlePrivateEquityReviewPage();
      break;
      case "niche-asset-review-screen.html":
      handleNicheAssetReviewPage();
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
          window.location.href = "./niche-assets-type.html";
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
      const subAssetType = btn.id.replace("-btn", "");
      clientDetails.currentSubAssetType = subAssetType.includes("skip")
        ? "unspecified"
        : subAssetType;
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
      if (btn.id === "skip-private-equity-type-btn") {
        clientDetails.currentSubAssetType = "unspecified";
      } else {
        clientDetails.currentSubAssetType = btn.id.replace("-btn", "");
      }
      saveClientDetails();
      window.location.href = "./private-equity-form.html";
    });
  });
}

function handleNicheAssetTypePage() {
  const subAssetButtons = document.querySelectorAll(
    ".inner-niche-asset  .fancy-button"
  );
  subAssetButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (btn.id === "skip-niche-asset-type-btn") {
        clientDetails.currentSubAssetType = "unspecified";
      } else {
        clientDetails.currentSubAssetType = btn.id.replace("-btn", "");
      }
      saveClientDetails();
      window.location.href = "niche-asset-form.html";
    });
  });
}

function handleNicheAssetFormPage() {
  const nicheAssetsDetailsForm = document.getElementById("nicheAsset-asset-details-form");
  const nicheAssetsNextBtn = document.getElementById("nicheAsset-asset-details-next-btn");
  const nicheImgContainer = document.querySelector(".nicheAsset-image-container");

  console.log("Current clientDetails:", clientDetails); // Debugging log

  // Check if clientDetails and currentSubAssetType are defined
  if (clientDetails && clientDetails.currentSubAssetType) {
    console.log("Current sub asset type:", clientDetails.currentSubAssetType); // Debugging log

    // Update background image based on the selected niche asset type
    switch (clientDetails.currentSubAssetType) {
      case "art":
        nicheImgContainer.style.backgroundImage = "url('./images/art.jpg')";
        break;
      case "luxuryVehicle":
        nicheImgContainer.style.backgroundImage = "url('./images/yacht.jpg')";
        break;
      case "otherCollection":
        nicheImgContainer.style.backgroundImage = "url('./images/wine.jpg')";
        break;
      default:
        // Keep the default image if no specific type is selected or for "unspecified"
        nicheImgContainer.style.backgroundImage = "url('./images/ cornelia-ng-2zHQhfEpisc-unsplash.jpg')";
        console.log("No specific type selected or unspecified"); // Debugging log
        break;
    }
  } else {
    console.log("clientDetails or currentSubAssetType is undefined"); // Debugging log
  }

  // Add event listener for the next button
  nicheAssetsNextBtn.addEventListener("click", function (e) {
    e.preventDefault();

    let newAsset = {
      type: clientDetails.currentSubAssetType,
      name: document.querySelector(".nicheAsset-name-input").value,
      value: document.querySelector(".nicheAsset-value-input").value,
    };

    if (!clientDetails.assets.nicheAssets) {
      clientDetails.assets.nicheAssets = [];
    }

    clientDetails.assets.nicheAssets.push(newAsset);
    saveClientDetails();

    console.log("Added new niche asset:", newAsset);
    console.log("Updated clientDetails:", clientDetails);

    // Navigate to the review screen
    window.location.href = "./niche-asset-review-screen.html";
  });
}





function handleNicheAssetReviewPage() {
  const nicheAssetEditBtn = document.getElementById("niche-asset-edit-details-btn");
  const nicheAssetConfirmBtn = document.getElementById("niche-asset-confirm-details-btn");
  const nicheAssetEditForm = document.getElementById("niche-edit-form");
  const editTypeSelect = document.getElementById("edit-type");

  // Populate review fields
  const currentAsset = clientDetails.assets.nicheAssets[clientDetails.assets.nicheAssets.length - 1];
  document.getElementById("edit-client-name").value = clientDetails.name;
  editTypeSelect.value = currentAsset.type;
  document.getElementById("edit-nicheAsset-name").value = currentAsset.name;
  document.getElementById("edit-nicheAsset-value").value = currentAsset.value;

  // Initially disable all form fields
  document.querySelectorAll("#niche-edit-form input, #niche-edit-form select")
    .forEach(el => el.disabled = true);

  nicheAssetEditBtn.addEventListener("click", function() {
    // Enable editing of fields
    document.querySelectorAll("#niche-edit-form input, #niche-edit-form select")
      .forEach(el => el.disabled = false);
    nicheAssetEditBtn.style.display = "none";
    nicheAssetConfirmBtn.style.display = "inline-block";
  });

  nicheAssetConfirmBtn.addEventListener("click", function(e) {
    e.preventDefault();
    const editedAsset = {
      type: editTypeSelect.value,
      name: document.getElementById("edit-nicheAsset-name").value,
      value: document.getElementById("edit-nicheAsset-value").value
    };

    clientDetails.assets.nicheAssets[clientDetails.assets.nicheAssets.length - 1] = editedAsset;
    saveClientDetails();
    console.log("Updated niche asset:", editedAsset);
    console.log("Updated clientDetails:", clientDetails);

    // Navigate to add-another-asset screen
    window.location.href = "./add-another-asset-screen.html";
  });

  // Update background image based on the asset type
  const nicheReviewImgContainer = document.querySelector(".niche-reviewImage-container");
  switch (currentAsset.type) {
    case "art":
      nicheReviewImgContainer.style.backgroundImage = "url('./images/art.jpg')";
      break;
    case "luxuryVehicle":
      nicheReviewImgContainer.style.backgroundImage = "url('./images/yacht.jpg')";
      break;
    case "otherCollection":
      nicheReviewImgContainer.style.backgroundImage = "url('./images/wine.jpg')";
      break;
    default:
      // Keep the default image for unspecified type
      break;
  }
}







function handlePrivateEquityFormPage() {
  const privateEquityDetailsForm = document.getElementById(
    "private-equity-asset-details-form"
  );
  const privateEquityNextBtn = document.getElementById(
    "private-equity-asset-details-next-btn"
  );

  if (clientDetails.currentSubAssetType === "unspecified") {
    const fundOrCompanyNameInput = document.querySelector(
      ".pe-asset-name-input"
    );
    const fundOrCompanyNameLabel = document.querySelector(
      ".pe-asset-name-label"
    );
    const isinInput = document.querySelector(".pe-isin-input");
    const isinLabel = document.querySelector(".pe-isin-label");

    fundOrCompanyNameInput.classList.add("hidden");
    fundOrCompanyNameLabel.classList.add("hidden");
    isinInput.classList.add("hidden");
    isinLabel.classList.add("hidden");
  }

  privateEquityNextBtn.addEventListener("click", function (e) {
    e.preventDefault();

    let newAsset = {
      type: clientDetails.currentSubAssetType,
      fundOrCompanyName:
        clientDetails.currentSubAssetType === "unspecified"
          ? "unspecified"
          : document.querySelector(".pe-asset-name-input").value,
      isin:
        clientDetails.currentSubAssetType === "unspecified"
          ? "unspecified"
          : document.querySelector(".pe-isin-input").value,
      sharesAmount: document.querySelector(".pe-sharesAmount-input").value,
      investmentValue: document.querySelector(".pe-value-input").value,
      buyPrice: document.querySelector(".pe-buyPrice-input").value,
      income_expense: getTableData("pe") || "NA",
    };

    if (!clientDetails.assets.privateEquity) {
      clientDetails.assets.privateEquity = [];
    }

    // Update clientDetails with the new asset information
    clientDetails.sharesAmount = newAsset.sharesAmount;
    clientDetails.investmentValue = newAsset.investmentValue;
    clientDetails.buyPrice = newAsset.buyPrice;

    clientDetails.assets.privateEquity.push(newAsset);
    saveClientDetails();

    console.log("Added new private equity asset:", newAsset);
    console.log("Updated clientDetails:", clientDetails);

    // Navigate to the review screen
    window.location.href = "./private-equity-review-screen.html";
  });
}

function handlePrivateEquityReviewPage() {
  const privateEquityEditBtn = document.getElementById(
    "private-equity-edit-details-btn"
  );
  const privateEquityConfirmBtn = document.getElementById(
    "private-equity-confirm-details-btn"
  );
  const privateEquityEditForm = document.getElementById(
    "private-equity-edit-form"
  );
  const editTypeSelect = document.getElementById("edit-type");

  const fundOrCompanyNameInput = document.getElementById(
    "edit-fundOrCompany-name"
  );
  const fundOrCompanyNameLabel = document.querySelector(
    'label[for="edit-fundOrCompany-name"]'
  );
  const isinInput = document.getElementById("edit-isin");
  const isinLabel = document.querySelector('label[for="edit-isin"]');

  // Populate review fields
  const currentAsset =
    clientDetails.assets[clientDetails.currentAssetType][
      clientDetails.assets[clientDetails.currentAssetType].length - 1
    ];
  document.getElementById("edit-client-name").value = clientDetails.name;
  editTypeSelect.value = currentAsset.type;
  fundOrCompanyNameInput.value = currentAsset.fundOrCompanyName;
  isinInput.value = currentAsset.isin;
  document.getElementById("edit-shares").value = currentAsset.sharesAmount;
  document.getElementById("edit-investmentValue").value =
    currentAsset.investmentValue;
  document.getElementById("edit-buyPrice").value = currentAsset.buyPrice;

  // Function to toggle visibility of fund/company name and ISIN fields
  function toggleFieldsVisibility(type) {
    if (type === "unspecified") {
      fundOrCompanyNameInput.classList.add("hidden");
      fundOrCompanyNameLabel.classList.add("hidden");
      isinInput.classList.add("hidden");
      isinLabel.classList.add("hidden");
    } else {
      fundOrCompanyNameInput.classList.remove("hidden");
      fundOrCompanyNameLabel.classList.remove("hidden");
      isinInput.classList.remove("hidden");
      isinLabel.classList.remove("hidden");
    }
  }

  // Initially set fields visibility
  toggleFieldsVisibility(currentAsset.type);

  // Initially disable all form fields
  document
    .querySelectorAll(
      "#private-equity-edit-form input, #private-equity-edit-form select"
    )
    .forEach((el) => (el.disabled = true));

  privateEquityEditBtn.addEventListener("click", function () {
    // Enable editing of fields
    document
      .querySelectorAll(
        "#private-equity-edit-form input, #private-equity-edit-form select"
      )
      .forEach((el) => (el.disabled = false));
    privateEquityEditBtn.style.display = "none";
    privateEquityConfirmBtn.style.display = "inline-block";
  });

  // Add event listener for type changes
  editTypeSelect.addEventListener("change", function () {
    toggleFieldsVisibility(this.value);
    if (this.value === "unspecified") {
      fundOrCompanyNameInput.value = "unspecified";
      isinInput.value = "unspecified";
    }
  });

  privateEquityConfirmBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const editedAsset = {
      type: editTypeSelect.value,
      fundOrCompanyName:
        editTypeSelect.value === "unspecified"
          ? "unspecified"
          : fundOrCompanyNameInput.value,
      isin:
        editTypeSelect.value === "unspecified"
          ? "unspecified"
          : isinInput.value,
      sharesAmount: document.getElementById("edit-shares").value,
      investmentValue: document.getElementById("edit-investmentValue").value,
      buyPrice: document.getElementById("edit-buyPrice").value,
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

// async function handleRealEstateFormPage() {
//   await initDropdown();

//   const nextAssetBtn = document.getElementById("asset-details-next-btn");
//   const countryListItems = document.querySelectorAll("#countryList li a");
//   const cityListItems = document.querySelectorAll("#cityList li a");

//   let countryValue = "";

//   countryListItems.forEach((item) => {
//     item.addEventListener("click", (e) => {
//       countryValue = e.target.innerText;
//     });
//   });

//   // document.getElementById("ieCheck").addEventListener("change", function () {
//   //   var table = document.getElementById("income-expense-table");
//   //   if (this.checked) {
//   //     table.style.display = "block";
//   //   } else {
//   //     table.style.display = "none";
//   //   }
//   // });

//   nextAssetBtn.addEventListener("click", function (e) {
//     e.preventDefault();
//     const countryElement = document.getElementById("countryDropdown");
//     const cityElement = document.getElementById("cityDropdown");

//     let newAsset = {
//       // need to add more deets: income, expense, subtypes
//       type: clientDetails.currentSubAssetType,
//       name: document.querySelector(".asset-name-input").value,
//       country: countryElement.innerText.match(/Select/gi)
//         ? "unspecified"
//         : countryElement.innerText,
//       city: cityElement.innerText.match(/Select/gi)
//         ? "unspecified"
//         : cityElement.innerText,
//       assetCategory: document.getElementById("subCategories").value,
//       address: document.querySelector(".address-input").value,
//       value: document.querySelector(".value-input").value,
//       income_expense: getTableData("re") || "NA",
//     };

//     // if (!clientDetails.assets[clientDetails.currentAssetType]) {
//     //   clientDetails.assets[clientDetails.currentAssetType] = [];
//     // }
//     // clientDetails.assets[clientDetails.currentAssetType].push(newAsset);

//     clientDetails.assets.realEstate.push(newAsset);

//     saveClientDetails();
//     console.log("Added new asset:", newAsset);
//     console.log("Updated clientDetails:", clientDetails);
//     window.location.href = "./review-screen.html";
//   });
// }

async function handleRealEstateFormPage() {
  await initDropdown();

  const nextAssetBtn = document.getElementById("asset-details-next-btn");
  const countryListItems = document.querySelectorAll("#countryList li a");
  // const cityListItems = document.querySelectorAll("#cityList li a");

  let countryValue = "";

  countryListItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      countryValue = e.target.innerText;
    });
  });

  nextAssetBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const countryElement = document.getElementById("countryDropdown");
    // const cityElement = document.getElementById("cityDropdown");

    let newAsset = {
      type: clientDetails.currentSubAssetType,
      name: document.querySelector(".asset-name-input").value,
      country: countryElement.innerText.match(/Select/gi)
        ? "unspecified"
        : countryElement.innerText,
      // city: cityElement.innerText.match(/Select/gi)
      //   ? "unspecified"
      //   : cityElement.innerText,
      assetCategory: document.getElementById("subCategories").value,
      address: document.querySelector(".address-input").value,
      value: document.querySelector(".value-input").value,
      income_expense: JSON.parse(document.querySelector(".income-expense-data").value) || [],
    };

    clientDetails.assets.realEstate.push(newAsset);

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
  // document.getElementById("edit-city").value = currentAsset.city;
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
      // city: capitalizeFirstLetter(document.getElementById("edit-city").value),
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
