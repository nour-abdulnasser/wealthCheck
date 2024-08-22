// Global clientDetails object
let clientDetails = {
  name: "",
  assets: {
    realEstate: [],
    privateEquity: [],
    nicheAssets: [],
    financialAssetsWithOtherAdvisors: [],
  },
  currentAssetType: "",
  currentSubAssetType: "",
  fullIncomeExpenses: {
    linked: [],
    unlinked: []
  }
};


function loadClientDetails() {
  const sessionData = sessionStorage.getItem("clientDetails");
  const localData = localStorage.getItem("clientDetails");

  if (sessionData) {
    clientDetails = JSON.parse(sessionData);
  } else if (localData) {
    clientDetails = JSON.parse(localData);
    sessionStorage.setItem("clientDetails", localData);
  }

  // Ensure fullIncomeExpenses is always present
  if (!clientDetails.fullIncomeExpenses) {
    clientDetails.fullIncomeExpenses = {
      linked: [],
      unlinked: []
    };
  }

  console.log("Loaded client details:", clientDetails);
}


function saveClientDetails() {
  localStorage.setItem("clientDetails", JSON.stringify(clientDetails));
  sessionStorage.setItem("clientDetails", JSON.stringify(clientDetails));
  console.log("Saved client details:", clientDetails);
  if (window.location.pathname.includes('income-expenses.html')) {
    updateIncomeExpensesTable();
  }
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
    fullIncomeExpenses: {
      linked: [],
      unlinked: []
    }
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

function addRow(assetType) {
  const rowTemplate = document.querySelector(
    `#dataTable-${assetType} tbody tr:last-child`
  );

  if (rowTemplate) {
    const newRow = rowTemplate.cloneNode(true); // Clone the last row

    // Clear the values of the cloned row (optional)
    const inputs = newRow.querySelectorAll("input, select");
    inputs.forEach((input) => {
      if (input.tagName === "SELECT") {
        input.selectedIndex = 0; // Reset the select dropdown
      } else {
        input.value = ""; // Clear the input field
      }
    });

    // Append the new row to the table body
    document.querySelector(`#dataTable-${assetType} tbody`).appendChild(newRow);
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

function getTableData(assetType) {
  const rows = document.querySelectorAll(`#dataTable-${assetType} tbody tr`);

  const data = [];
  rows.forEach((row) => {
    const typeSelect = row.querySelector(".income-expense-select");
    const conceptInput = row.querySelector(".ie-concept-input");
    const amountInput = row.querySelector(".ie-amount-input");
    const frequencySelect = row.querySelector(".ie-frequency-select");

    const type = typeSelect
      ? typeSelect.value.match(/select/gi)
        ? "unspecified"
        : typeSelect.value
      : null;
    const concept = conceptInput ? conceptInput.value : "unspecified";
    const amount = amountInput
      ? parseFloat(amountInput.value) == null
        ? "unspecified"
        : parseFloat(amountInput.value)
      : NaN;
    const frequency = frequencySelect
      ? frequencySelect.value.match(/select/gi)
        ? "unspecified"
        : frequencySelect.value
      : null;

    // Only push if there is valid data
    // if (type && concept && !isNaN(amount) && frequency) {
    data.push({
      type: type,
      concept: concept,
      amount: amount,
      frequency: frequency,
    });
    // }
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

// toggle for simple toggling, no data manipulation
// toggle in form not review
function togglePopup(overlayId) {
  const overlay = document.getElementById(overlayId);
  overlay.classList.toggle("show");
}

// for populating in popup in review
function popupPopulate(overlayId, identifier) {
  const overlay = document.getElementById(overlayId);
  document.querySelector(".popup-edit").style.display = "inline-block";
  document.querySelector(".add-new").style.display = "none";

  document.querySelector(".popup-done").style.display = "none";

  const dataInput = document.querySelector(
    `.income-expense-data-${identifier}`
  );
  populateIncomeExpenseTable(JSON.parse(dataInput.value), identifier);
  overlay.classList.toggle("show");
}

// done -> store table data
function popupDone(overlayId, identifier) {
  const overlay = document.getElementById(overlayId);
  const incomeExpenseDataEdit = getTableData(identifier);
  document.querySelector(`.income-expense-data-${identifier}`).value =
    JSON.stringify(incomeExpenseDataEdit);

  overlay.classList.toggle("show");

  console.log(document.querySelector(`.income-expense-data-${identifier}`));
}

// for the income expense table review
function populateIncomeExpenseTable(dataArray, identifier) {
  const tableBody = document.querySelector(`#dataTable-${identifier} tbody`);
  tableBody.innerHTML = ""; // Clear existing rows

  dataArray.forEach((item) => {
    const row = document.createElement("tr");

    // Create and append the type select
    const typeCell = document.createElement("td");
    const typeSelect = document.createElement("select");
    typeSelect.className = "income-expense-select";

    const typeOptionPlaceholder = document.createElement("option");
    typeOptionPlaceholder.disabled = true;
    typeOptionPlaceholder.textContent = "Select type";
    typeOptionPlaceholder.selected = true;
    typeSelect.appendChild(typeOptionPlaceholder);

    const incomeOption = document.createElement("option");
    incomeOption.value = "Income";
    incomeOption.textContent = "Income";
    if (item.type === "Income") incomeOption.selected = true;
    typeSelect.appendChild(incomeOption);

    const expenseOption = document.createElement("option");
    expenseOption.value = "Expense";
    expenseOption.textContent = "Expense";
    if (item.type === "Expense") expenseOption.selected = true;
    typeSelect.appendChild(expenseOption);

    typeCell.appendChild(typeSelect);
    row.appendChild(typeCell);

    // Create and append the concept input
    const conceptCell = document.createElement("td");
    const conceptInput = document.createElement("input");
    conceptInput.type = "text";
    conceptInput.className = "ie-concept-input";
    conceptInput.value = item.concept;
    conceptCell.appendChild(conceptInput);
    row.appendChild(conceptCell);

    // Create and append the amount input
    const amountCell = document.createElement("td");
    const amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.className = "ie-amount-input";
    amountInput.value = item.amount;
    amountCell.appendChild(amountInput);
    row.appendChild(amountCell);

    // Create and append the frequency select
    const frequencyCell = document.createElement("td");
    const frequencySelect = document.createElement("select");
    frequencySelect.className = "ie-frequency-select";

    const frequencyOptionPlaceholder = document.createElement("option");
    frequencyOptionPlaceholder.disabled = true;
    frequencyOptionPlaceholder.textContent = "Select frequency";
    frequencyOptionPlaceholder.selected = true;

    frequencySelect.appendChild(frequencyOptionPlaceholder);

    const monthlyOption = document.createElement("option");
    monthlyOption.value = "Monthly";
    monthlyOption.textContent = "Monthly";
    if (item.frequency === "Monthly") monthlyOption.selected = true;
    frequencySelect.appendChild(monthlyOption);

    const annualOption = document.createElement("option");
    annualOption.value = "Annual";
    annualOption.textContent = "Annual";
    if (item.frequency === "Annual") annualOption.selected = true;
    frequencySelect.appendChild(annualOption);

    frequencyCell.appendChild(frequencySelect);
    row.appendChild(frequencyCell);

    // Create and append the delete action cell
    const actionCell = document.createElement("td");
    actionCell.className = "actionCell";
    const deleteLink = document.createElement("a");
    deleteLink.className = "delete";
    deleteLink.title = "Delete";
    deleteLink.dataset.toggle = "tooltip";
    deleteLink.style.cursor = "pointer";
    deleteLink.onclick = function () {
      deleteRow(this, identifier);
    };

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fa-solid fa-trash-can";
    deleteLink.appendChild(deleteIcon);

    actionCell.appendChild(deleteLink);
    row.appendChild(actionCell);

    // Append the row to the table body
    tableBody.appendChild(row);
  });
  document
    .querySelectorAll(
      `#dataTable-${identifier} tbody input, #dataTable-${identifier} tbody select`
    )
    .forEach((element) => (element.disabled = true));
}

function editIncomeExpense(elementId) {
  document.querySelector(".popup-done").style.display = "inline-block";
  document.querySelector(".add-new").style.display = "inline-block";
  document.querySelector(".popup-edit").style.display = "none";
  const element = document.getElementById(`${elementId}`);
  element.querySelectorAll("tbody input, tbody select").forEach((el) => {
    el.disabled = false;
  });
}

function populateRealEstateSubtypes(
  isReviewPage = false,
  selectElement = null
) {
  const subCategoriesSelect =
    selectElement || document.getElementById("subCategories");
  if (!subCategoriesSelect) {
    console.error("Asset category select element not found");
    return;
  }

  const subCategoriesContainer = subCategoriesSelect.closest(
    ".dropdown-container"
  );
  const realEstateType = clientDetails.currentSubAssetType;

  // Clear existing options
  subCategoriesSelect.innerHTML = "";

  // Define subtypes for each real estate type
  const subtypes = {
    unspecified: [{ value: "unspecified", label: "Unspecified" }],
    residential: [
      { value: "unspecified", label: "Unspecified" },
      { value: "residential for rent", label: "Residential property for rent" },
      { value: "housing", label: "Residential housing" },
    ],
    commercial: [
      { value: "unspecified", label: "Unspecified" },

      { value: "commercial for rent", label: "Commercial property for rent" },
      { value: "office", label: "Office" },
    ],
    industrial: [
      { value: "unspecified", label: "Unspecified" },

      { value: "factories", label: "Factories" },
      { value: "warehouses", label: "Warehouses" },
    ],
    land: [
      { value: "unspecified", label: "Unspecified" },

      { value: "agricultural", label: "Agricultural land" },
    ],
  };

  if (realEstateType === "unspecified" && !isReviewPage) {
    // Hide the dropdown if unspecified and not on review page
    if (subCategoriesContainer) {
      subCategoriesContainer.style.display = "none";
    }
  } else {
    if (subCategoriesContainer) {
      subCategoriesContainer.style.display = "flex";
    }

    if (isReviewPage) {
      // Add all types and subtypes for the review page
      Object.entries(subtypes).forEach(([type, typeSubtypes]) => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = capitalizeFirstLetter(type);

        typeSubtypes.forEach((subtype) => {
          const option = document.createElement("option");
          option.value = subtype.value;
          option.textContent = subtype.label;
          optgroup.appendChild(option);
        });

        subCategoriesSelect.appendChild(optgroup);
      });
    } else {
      // Add specific subtypes for the selected real estate type
      const relevantSubtypes = subtypes[realEstateType] || subtypes.unspecified;
      relevantSubtypes.forEach((subtype) => {
        const option = document.createElement("option");
        option.value = subtype.value;
        option.textContent = subtype.label;
        subCategoriesSelect.appendChild(option);
      });
    }
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
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
      handleNicheAssetFormPage();
      break;
    case "financial-assets-form.html":
      handleFinancialAssetsFormPage();
      break;
    case "real-estate-review-screen.html":
      handleRealEstateReviewPage();
      break;
    case "private-equity-review-screen.html":
      handlePrivateEquityReviewPage();
      break;
    case "niche-asset-review-screen.html":
      handleNicheAssetReviewPage();
      break;
      case "income-expenses.html":
        handleIncomeExpensesPage();
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

document.getElementById('name-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
      event.preventDefault();  // Prevent the default form submission behavior
      // Trigger navigation to the next page or next step in your form
      window.location.href = 'main-menu.html';  // Replace with the correct URL or function
  }
});

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
  const nicheAssetsDetailsForm = document.getElementById(
    "nicheAsset-asset-details-form"
  );
  const nicheAssetsNextBtn = document.getElementById(
    "nicheAsset-asset-details-next-btn"
  );
  const nicheImgContainer = document.querySelector(
    ".nicheAsset-image-container"
  );

  document.querySelector(".income-expense-data-na").value = JSON.stringify([]);

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
        nicheImgContainer.style.backgroundImage =
          "url('./images/ cornelia-ng-2zHQhfEpisc-unsplash.jpg')";
        console.log("No specific type selected or unspecified"); // Debugging log
        break;
    }
  } else {
    console.log("clientDetails or currentSubAssetType is undefined"); // Debugging log
  }

  // Add event listener for the next button
  nicheAssetsNextBtn.addEventListener("click", function (e) {
    e.preventDefault();
    let incomeExpenseData = document.querySelector(".income-expense-data-na");
    let incomeExpenseArray;

    try {
      incomeExpenseArray = JSON.parse(incomeExpenseData.value);
    } catch (error) {
      incomeExpenseArray = [];
    }

    let newAsset = {
      type: clientDetails.currentSubAssetType,
      name: document.querySelector(".nicheAsset-name-input").value,
      value: document.querySelector(".nicheAsset-value-input").value,
      income_expense: incomeExpenseArray,
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
  const nicheAssetEditBtn = document.getElementById(
    "niche-asset-edit-details-btn"
  );
  const nicheAssetConfirmBtn = document.getElementById(
    "niche-asset-confirm-details-btn"
  );
  const nicheAssetEditForm = document.getElementById("niche-edit-form");
  const editTypeSelect = document.getElementById("edit-type");

  // Populate review fields
  const currentAsset =
    clientDetails.assets.nicheAssets[
      clientDetails.assets.nicheAssets.length - 1
    ];
  document.querySelector(".income-expense-data-na-edit").value = JSON.stringify(
    currentAsset.income_expense
  );
  document.getElementById("edit-client-name").value = clientDetails.name;
  editTypeSelect.value = currentAsset.type;
  document.getElementById("edit-nicheAsset-name").value = currentAsset.name;
  document.getElementById("edit-nicheAsset-value").value = currentAsset.value;

  // Initially disable all form fields
  document
    .querySelectorAll("#niche-edit-form input, #niche-edit-form select")
    .forEach((el) => (el.disabled = true));

  nicheAssetEditBtn.addEventListener("click", function () {
    // Enable editing of fields
    document
      .querySelectorAll("#niche-edit-form input, #niche-edit-form select")
      .forEach((el) => (el.disabled = false));
    nicheAssetEditBtn.style.display = "none";
    nicheAssetConfirmBtn.style.display = "inline-block";
  });

  nicheAssetConfirmBtn.addEventListener("click", function (e) {
    e.preventDefault();
    let incomeExpenseInput = document.querySelector(
      ".income-expense-data-na-edit"
    );
    let incomeExpenseArray;

    try {
      incomeExpenseArray = JSON.parse(incomeExpenseInput.value);
    } catch (error) {
      incomeExpenseArray = [];
    }
    const editedAsset = {
      type: editTypeSelect.value,
      name: document.getElementById("edit-nicheAsset-name").value,
      value: document.getElementById("edit-nicheAsset-value").value,
      income_expense: incomeExpenseArray,
    };

    clientDetails.assets.nicheAssets[
      clientDetails.assets.nicheAssets.length - 1
    ] = editedAsset;

    // Update fullIncomeExpenses
    incomeExpenseArray.forEach(item => {
      const fullItem = {
        ...item,
        assetName: editedAsset.name
      };
      clientDetails.fullIncomeExpenses.linked.push(fullItem);
    });

    saveClientDetails();
    console.log("Updated niche asset:", editedAsset);
    console.log("Updated clientDetails:", clientDetails);

    // Update background image based on the asset type
    const nicheReviewImgContainer = document.querySelector(
      ".niche-reviewImage-container"
    );
    switch (editedAsset.type) {
      case "art":
        nicheReviewImgContainer.style.backgroundImage = "url('./images/art.jpg')";
        break;
      case "luxuryVehicle":
        nicheReviewImgContainer.style.backgroundImage =
          "url('./images/yacht.jpg')";
        break;
      case "otherCollection":
        nicheReviewImgContainer.style.backgroundImage =
          "url('./images/wine.jpg')";
        break;
      default:
        // Keep the default image for unspecified type
        nicheReviewImgContainer.style.backgroundImage =
          "url('./images/default-niche-asset.jpg')";
        break;
    }

    // Navigate to main menu
    window.location.href = "./add-another-asset-screen.html";
  });
}

function handlePrivateEquityFormPage() {
  document.querySelector(".income-expense-data-pe").value = JSON.stringify([]);

  const privateEquityDetailsForm = document.getElementById(
    "private-equity-asset-details-form"
  );
  const privateEquityNextBtn = document.getElementById(
    "private-equity-asset-details-next-btn"
  );

  if (clientDetails.currentSubAssetType === "unspecified") {
    const fundOrCompanyNameInput = document.querySelector(
      ".pe-asset-fundOrCompanyName-input"
    );
    const fundOrCompanyNameLabel = document.querySelector(
      ".pe-asset-fundOrCompanyName-label"
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
    let incomeExpenseData = document.querySelector(".income-expense-data-pe");
    let incomeExpenseArray;

    try {
      incomeExpenseArray = JSON.parse(incomeExpenseData.value);
    } catch (error) {
      incomeExpenseArray = [];
    }

    let newAsset = {
      type: clientDetails.currentSubAssetType,
      fundOrCompanyName:
        clientDetails.currentSubAssetType === "unspecified"
          ? "unspecified"
          : document.querySelector(".pe-asset-fundOrCompanyName-input").value,
      isin:
        clientDetails.currentSubAssetType === "unspecified"
          ? "unspecified"
          : document.querySelector(".pe-isin-input").value,
      sharesAmount: document.querySelector(".pe-sharesAmount-input").value,
      investmentValue: document.querySelector(".pe-value-input").value,
      buyPrice: document.querySelector(".pe-buyPrice-input").value,
      assetName: document.querySelector(".pe-assetName-input").value,
      income_expense: incomeExpenseArray,
    };

    if (!clientDetails.assets.privateEquity) {
      clientDetails.assets.privateEquity = [];
    }

    // Update clientDetails with the new asset information
    clientDetails.assetName = newAsset.assetName;
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
  document.querySelector(".income-expense-data-pe-edit").value = JSON.stringify(
    currentAsset.income_expense
  );
  document.getElementById("edit-client-name").value = clientDetails.name;
  editTypeSelect.value = currentAsset.type;
  fundOrCompanyNameInput.value = currentAsset.fundOrCompanyName;
  isinInput.value = currentAsset.isin;
  document.getElementById("edit-assetName").value = currentAsset.assetName;
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
    let incomeExpenseInput = document.querySelector(
      ".income-expense-data-pe-edit"
    );
    let incomeExpenseArray;

    try {
      incomeExpenseArray = JSON.parse(incomeExpenseInput.value);
    } catch (error) {
      incomeExpenseArray = [];
    }
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
      assetName: document.getElementById("edit-assetName").value,
      income_expense: incomeExpenseArray,
    };
    clientDetails.assets[clientDetails.currentAssetType][
      clientDetails.assets[clientDetails.currentAssetType].length - 1
    ] = editedAsset;

    // Update fullIncomeExpenses
    incomeExpenseArray.forEach(item => {
      const fullItem = {
        ...item,
        assetName: editedAsset.assetName
      };
      clientDetails.fullIncomeExpenses.linked.push(fullItem);
    });

    saveClientDetails();
    console.log("Updated asset:", editedAsset);
    console.log("Updated clientDetails:", clientDetails);

    // Navigate to main menu
    window.location.href = "./add-another-asset-screen.html";
  });
}

async function handleRealEstateFormPage() {
  await initDropdown();
  document.querySelector(".income-expense-data-re").value = JSON.stringify([]);

  // Call the new function to populate subtypes
  populateRealEstateSubtypes();

  const nextAssetBtn = document.getElementById("asset-details-next-btn");
  const countryListItems = document.querySelectorAll("#countryList li a");
  let countryValue = "";

  countryListItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      countryValue = e.target.innerText;
    });
  });

  nextAssetBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const countryElement = document.getElementById("countryDropdown");
    let incomeExpenseData = document.querySelector(".income-expense-data-re");
    let incomeExpenseArray;

    try {
      incomeExpenseArray = JSON.parse(incomeExpenseData.value);
    } catch (error) {
      incomeExpenseArray = [];
    }

    let newAsset = {
      type: clientDetails.currentSubAssetType,
      name: document.querySelector(".asset-name-input").value,
      country: countryElement.innerText.match(/Select/gi)
        ? "unspecified"
        : countryElement.innerText,
      assetCategory:
        clientDetails.currentSubAssetType === "unspecified"
          ? "unspecified"
          : document.getElementById("subCategories").value,
      address: document.querySelector(".address-input").value,
      value: document.querySelector(".value-input").value,
      income_expense: incomeExpenseArray,
    };

    clientDetails.assets.realEstate.push(newAsset);

    saveClientDetails();
    console.log("Added new asset:", newAsset);
    console.log("Updated clientDetails:", clientDetails);
    window.location.href = "./real-estate-review-screen.html";
  });
}

function handleRealEstateReviewPage() {
  const editBtn = document.getElementById("edit-details-btn");
  const confirmBtn = document.getElementById("confirm-details-btn");

  // Populate review fields
  const currentAsset = clientDetails.assets[clientDetails.currentAssetType][
    clientDetails.assets[clientDetails.currentAssetType].length - 1
  ];

  document.querySelector(".income-expense-data-re-edit").value = JSON.stringify(
    currentAsset.income_expense
  );

  document.getElementById("edit-client-name").value = clientDetails.name;
  document.getElementById("edit-asset-name").value = currentAsset.name;
  document.getElementById("edit-address").value = currentAsset.address;
  document.getElementById("edit-country").innerText =
    currentAsset.country || "Select Country";
  document.getElementById("edit-value").value = currentAsset.value;

  // Populate the asset category dropdown
  const assetTypeSelect = document.getElementById("edit-subtype");
  if (assetTypeSelect) {
    populateRealEstateSubtypes(true, assetTypeSelect);
    assetTypeSelect.value = currentAsset.assetCategory || "unspecified";
  } else {
    console.error("Asset type select element not found on review page");
  }

  // Initially disable all form fields
  document
    .querySelectorAll("#review-details input, #review-details select")
    .forEach((el) => (el.disabled = true));

  editBtn.addEventListener("click", async function () {
    countriesArr = await loadCountries();
    populateDropdown(
      countriesArr,
      document.getElementById("countryListEdit"),
      "countrySearchEdit",
      "edit-country"
    );
    const countryListItems = document.querySelectorAll("#countryListEdit li a");
    let countryValue = "";
    countryListItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        countryValue = e.target.innerText;
        document.getElementById("edit-country").innerText = countryValue;
      });
    });
    // Enable editing of fields
    document
      .querySelectorAll(
        "#review-details input, #review-details select, #edit-country"
      )
      .forEach((el) => (el.disabled = false));
    editBtn.style.display = "none";
    confirmBtn.style.display = "inline-block";
  });

  confirmBtn.addEventListener("click", function (e) {
    e.preventDefault();
    let incomeExpenseInput = document.querySelector(
      ".income-expense-data-re-edit"
    );
    let incomeExpenseArray;

    try {
      incomeExpenseArray = JSON.parse(incomeExpenseInput.value);
    } catch (error) {
      incomeExpenseArray = [];
    }

    const editedAsset = {
      type: clientDetails.currentSubAssetType,
      name: document.getElementById("edit-asset-name").value.toUpperCase(),
      address: capitalizeFirstLetter(
        document.getElementById("edit-address").value
      ),
      country: capitalizeFirstLetter(
        document.getElementById("edit-country").innerText
      ),
      assetCategory: document.getElementById("edit-subtype").value,
      value: document.getElementById("edit-value").value,
      income_expense: incomeExpenseArray,
    };

    clientDetails.assets[clientDetails.currentAssetType][
      clientDetails.assets[clientDetails.currentAssetType].length - 1
    ] = editedAsset;

    // Update fullIncomeExpenses
    incomeExpenseArray.forEach(item => {
      const fullItem = {
        ...item,
        assetName: editedAsset.name
      };
      clientDetails.fullIncomeExpenses.linked.push(fullItem);
    });

    saveClientDetails();
    console.log("Updated asset:", editedAsset);
    console.log("Updated clientDetails:", clientDetails);

    // Navigate to main menu
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

function handleIncomeExpensesPage() {
  updateIncomeExpensesTable();

  const addNewBtn = document.querySelector(".add-new");
  if (addNewBtn) {
    addNewBtn.addEventListener("click", () => {
      const newItem = {
        type: "Income",
        concept: "",
        amount: 0,
        frequency: "Monthly"
      };
      clientDetails.fullIncomeExpenses.unlinked.push(newItem);
      saveClientDetails();
    });
  }

  const doneBtn = document.querySelector(".done-btn");
  if (doneBtn) {
    doneBtn.addEventListener("click", () => {
      window.location.href = "./main-menu.html";
    });
  }
}

function updateIncomeExpensesTable() {
  const tableBody = document.querySelector("#dataTable-income-expenses tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  // Add linked income/expenses
  clientDetails.fullIncomeExpenses.linked.forEach(item => {
    const row = createIncomeExpenseRow(item, true);
    tableBody.appendChild(row);
  });

  // Add unlinked income/expenses
  clientDetails.fullIncomeExpenses.unlinked.forEach(item => {
    const row = createIncomeExpenseRow(item, false);
    tableBody.appendChild(row);
  });
}

function createIncomeExpenseRow(item, isLinked) {
  const row = document.createElement("tr");
  
  // Linked Asset dropdown
  const linkedAssetCell = document.createElement("td");
  const linkedAssetSelect = document.createElement("select");
  linkedAssetSelect.className = "form-control";
  
  // Add "None" option
  const noneOption = document.createElement("option");
  noneOption.value = "None";
  noneOption.textContent = "None";
  linkedAssetSelect.appendChild(noneOption);
  
  // Add all asset names as options
  Object.values(clientDetails.assets).flat().forEach(asset => {
    const option = document.createElement("option");
    option.value = asset.name;
    option.textContent = asset.name;
    linkedAssetSelect.appendChild(option);
  });
  
  linkedAssetSelect.value = isLinked ? item.assetName : "None";
  linkedAssetCell.appendChild(linkedAssetSelect);
  row.appendChild(linkedAssetCell);

  // Income or Expense
  const typeCell = document.createElement("td");
  const typeSelect = document.createElement("select");
  typeSelect.className = "form-control";
  ["Income", "Expense"].forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeSelect.appendChild(option);
  });
  typeSelect.value = item.type;
  typeCell.appendChild(typeSelect);
  row.appendChild(typeCell);

  // Concept
  const conceptCell = document.createElement("td");
  const conceptInput = document.createElement("input");
  conceptInput.type = "text";
  conceptInput.className = "form-control";
  conceptInput.value = item.concept;
  conceptCell.appendChild(conceptInput);
  row.appendChild(conceptCell);

  // Amount
  const amountCell = document.createElement("td");
  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.className = "form-control";
  amountInput.value = item.amount;
  amountCell.appendChild(amountInput);
  row.appendChild(amountCell);

  // Frequency
  const frequencyCell = document.createElement("td");
  const frequencySelect = document.createElement("select");
  frequencySelect.className = "form-control";
  ["Monthly", "Annual"].forEach(freq => {
    const option = document.createElement("option");
    option.value = freq;
    option.textContent = freq;
    frequencySelect.appendChild(option);
  });
  frequencySelect.value = item.frequency;
  frequencyCell.appendChild(frequencySelect);
  row.appendChild(frequencyCell);

  // Delete button
  const deleteCell = document.createElement("td");
  const deleteLink = document.createElement("a");
  deleteLink.className = "delete";
  deleteLink.title = "Delete";
  deleteLink.dataset.toggle = "tooltip";
  deleteLink.style.cursor = "pointer";
  deleteLink.onclick = () => deleteIncomeExpenseRow(deleteLink, isLinked ? "linked" : "unlinked", item);

  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fa-solid fa-trash-can";
  deleteLink.appendChild(deleteIcon);

  deleteCell.appendChild(deleteLink);
  row.appendChild(deleteCell);

  return row;
}



function deleteIncomeExpenseRow(row, type, item) {
  const index = clientDetails.fullIncomeExpenses[type].findIndex(
    i => i.concept === item.concept && i.amount === item.amount
  );
  if (index > -1) {
    clientDetails.fullIncomeExpenses[type].splice(index, 1);
    saveClientDetails();
  }
  row.remove();
}
// You can add any additional utility functions or global event listeners here if needed

// End of script

// clearAllLocalStorage()
