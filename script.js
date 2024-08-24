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
    unlinked: [],
  },
};

<<<<<<< HEAD
=======


>>>>>>> f2104fb85038938d4a31af6a4feb63a00d6523be
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
      unlinked: [],
    };
  }

  console.log("Loaded client details:", clientDetails);
}

function saveClientDetails() {
  localStorage.setItem("clientDetails", JSON.stringify(clientDetails));
  sessionStorage.setItem("clientDetails", JSON.stringify(clientDetails));
  console.log("Saved client details:", clientDetails);
  if (window.location.pathname.includes("income-expenses.html")) {
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
      unlinked: [],
    },
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

// function populateSelect(options, selectElement) {
//   options.forEach((optionText) => {
//     const option = document.createElement("option");
//     option.value = optionText;
//     option.textContent = optionText;
//     selectElement.appendChild(option);
//   });
// }

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
    case "my-results.html":
      handleMyResults();
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

    document
      .getElementById("name-input")
      .addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault(); // Prevent the default form submission behavior
          // Trigger navigation to the next page or next step in your form
          window.location.href = "main-menu.html"; // Replace with the correct URL or function
        }
      });

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
    incomeExpenseArray.forEach((item) => {
      const fullItem = {
        ...item,
        assetName: editedAsset.name,
      };
      // Remove any existing entries for this asset
      clientDetails.fullIncomeExpenses.linked = clientDetails.fullIncomeExpenses.linked.filter(
        i => i.assetName !== editedAsset.name
      );
      // Add the new/updated entries
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
        nicheReviewImgContainer.style.backgroundImage =
          "url('./images/art.jpg')";
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

    // Navigate to add another asset screen
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
    incomeExpenseArray.forEach((item) => {
      const fullItem = {
        ...item,
        assetName: editedAsset.assetName,
      };
      // Remove any existing entries for this asset
      clientDetails.fullIncomeExpenses.linked = clientDetails.fullIncomeExpenses.linked.filter(
        i => i.assetName !== editedAsset.assetName
      );
      // Add the new/updated entries
      clientDetails.fullIncomeExpenses.linked.push(fullItem);
    });

    saveClientDetails();
    console.log("Updated asset:", editedAsset);
    console.log("Updated clientDetails:", clientDetails);

    // Navigate to add another asset screen
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
  const currentAsset =
    clientDetails.assets[clientDetails.currentAssetType][
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
    incomeExpenseArray.forEach((item) => {
      const fullItem = {
        ...item,
        assetName: editedAsset.name,
      };
      // Remove any existing entries for this asset
      clientDetails.fullIncomeExpenses.linked = clientDetails.fullIncomeExpenses.linked.filter(
        i => i.assetName !== editedAsset.name
      );
      // Add the new/updated entries
      clientDetails.fullIncomeExpenses.linked.push(fullItem);
    });

    saveClientDetails();
    console.log("Updated asset:", editedAsset);
    console.log("Updated clientDetails:", clientDetails);

    // Navigate to add another asset screen
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
<<<<<<< HEAD
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
        frequency: "Monthly",
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
  clientDetails.fullIncomeExpenses.linked.forEach((item) => {
    const row = createIncomeExpenseRow(item, true);
    tableBody.appendChild(row);
  });

  // Add unlinked income/expenses
  clientDetails.fullIncomeExpenses.unlinked.forEach((item) => {
    const row = createIncomeExpenseRow(item, false);
    tableBody.appendChild(row);
=======
    window.location.href = "./main-menu.html";
    
>>>>>>> f2104fb85038938d4a31af6a4feb63a00d6523be
  });
}

function createIncomeExpenseRow(item, isLinked) {
  console.log("Creating row for item:", item);
  console.log("Is linked:", isLinked);

  const row = document.createElement("tr");

  // Linked Asset dropdown
  const linkedAssetCell = document.createElement("td");
  const linkedAssetSelect = document.createElement("select");
<<<<<<< HEAD
  linkedAssetSelect.className = "form-control";

=======
  linkedAssetSelect.className = "form-control linked-asset-select";
  
>>>>>>> f2104fb85038938d4a31af6a4feb63a00d6523be
  // Add "None" option
  const noneOption = document.createElement("option");
  noneOption.value = "None";
  noneOption.textContent = "None";
  linkedAssetSelect.appendChild(noneOption);

  // Add all asset names as options
<<<<<<< HEAD
  Object.values(clientDetails.assets)
    .flat()
    .forEach((asset) => {
      const option = document.createElement("option");
      option.value = asset.name;
      option.textContent = asset.name;
      linkedAssetSelect.appendChild(option);
    });

  linkedAssetSelect.value = isLinked ? item.assetName : "None";
=======
  let assetNames = [];
  Object.values(clientDetails.assets).forEach(assetCategory => {
    if (Array.isArray(assetCategory)) {
      assetCategory.forEach(asset => {
        if (asset.name) {
          assetNames.push(asset.name);
        } else if (asset.assetName) {
          assetNames.push(asset.assetName);
        }
      });
    }
  });
  
  console.log("Available asset names:", assetNames);

  assetNames.forEach(assetName => {
    const option = document.createElement("option");
    option.value = assetName;
    option.textContent = assetName;
    linkedAssetSelect.appendChild(option);
  });
  
  // Set the correct value for the linked asset
  linkedAssetSelect.value = item.assetName || "None";
  console.log("Setting linked asset to:", linkedAssetSelect.value);
  
>>>>>>> f2104fb85038938d4a31af6a4feb63a00d6523be
  linkedAssetCell.appendChild(linkedAssetSelect);
  row.appendChild(linkedAssetCell);

  // Income or Expense
  const typeCell = document.createElement("td");
  const typeSelect = document.createElement("select");
<<<<<<< HEAD
  typeSelect.className = "form-control";
  ["Income", "Expense"].forEach((type) => {
=======
  typeSelect.className = "form-control income-expense-select";
  ["Income", "Expense"].forEach(type => {
>>>>>>> f2104fb85038938d4a31af6a4feb63a00d6523be
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
  conceptInput.className = "form-control concept-input";
  conceptInput.value = item.concept;
  conceptCell.appendChild(conceptInput);
  row.appendChild(conceptCell);

  // Amount
  const amountCell = document.createElement("td");
  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.className = "form-control amount-input";
  amountInput.value = item.amount;
  amountCell.appendChild(amountInput);
  row.appendChild(amountCell);

  // Frequency
  const frequencyCell = document.createElement("td");
  const frequencySelect = document.createElement("select");
<<<<<<< HEAD
  frequencySelect.className = "form-control";
  ["Monthly", "Annual"].forEach((freq) => {
=======
  frequencySelect.className = "form-control frequency-select";
  ["Monthly", "Annual"].forEach(freq => {
>>>>>>> f2104fb85038938d4a31af6a4feb63a00d6523be
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
<<<<<<< HEAD
  deleteLink.onclick = () =>
    deleteIncomeExpenseRow(deleteLink, isLinked ? "linked" : "unlinked", item);
=======
  deleteLink.onclick = () => deleteIncomeExpenseRow(row, isLinked ? "linked" : "unlinked", item);
>>>>>>> f2104fb85038938d4a31af6a4feb63a00d6523be

  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fa-solid fa-trash-can";
  deleteLink.appendChild(deleteIcon);

  deleteCell.appendChild(deleteLink);
  row.appendChild(deleteCell);

  // Add event listeners to update clientDetails when changes are made
  row.querySelectorAll('select, input').forEach(element => {
    element.addEventListener('change', function() {
      updateRowData(row);
    });
  });

  return row;
}

<<<<<<< HEAD
function deleteIncomeExpenseRow(row, type, item) {
  const index = clientDetails.fullIncomeExpenses[type].findIndex(
    (i) => i.concept === item.concept && i.amount === item.amount
  );
=======
function updateRowData(row) {
  const linkedAssetSelect = row.querySelector('.linked-asset-select');
  const typeSelect = row.querySelector('.income-expense-select');
  const conceptInput = row.querySelector('.concept-input');
  const amountInput = row.querySelector('.amount-input');
  const frequencySelect = row.querySelector('.frequency-select');

  if (!linkedAssetSelect || !typeSelect || !conceptInput || !amountInput || !frequencySelect) {
    console.error('One or more required elements not found in the row', row);
    return;
  }

  const linkedAsset = linkedAssetSelect.value;
  const type = typeSelect.value;
  const concept = conceptInput.value;
  const amount = parseFloat(amountInput.value) || 0;
  const frequency = frequencySelect.value;

  const updatedItem = { assetName: linkedAsset, type, concept, amount, frequency };
  
  const isLinked = linkedAsset !== 'None';
  const sourceArray = isLinked ? clientDetails.fullIncomeExpenses.linked : clientDetails.fullIncomeExpenses.unlinked;
  const targetArray = isLinked ? clientDetails.fullIncomeExpenses.linked : clientDetails.fullIncomeExpenses.unlinked;
  
  // Find the existing item in the source array
  const existingItemIndex = sourceArray.findIndex(item => 
    item === row.originalItem
  );

  // Remove the existing item if found
  if (existingItemIndex !== -1) {
    sourceArray.splice(existingItemIndex, 1);
  }

  // Add the updated item to the target array
  targetArray.push(updatedItem);

  // Update the row's originalItem reference
  row.originalItem = updatedItem;

  saveClientDetails();
  console.log("Updated clientDetails:", clientDetails);
}

function updateIncomeExpensesTable() {
  const tableBody = document.querySelector("#dataTable-income-expenses tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  console.log("Updating table with linked items:", clientDetails.fullIncomeExpenses.linked);
  // Add linked income/expenses
  clientDetails.fullIncomeExpenses.linked.forEach(item => {
    const row = createIncomeExpenseRow(item, true);
    row.originalItem = item;
    tableBody.appendChild(row);
  });

  console.log("Updating table with unlinked items:", clientDetails.fullIncomeExpenses.unlinked);
  // Add unlinked income/expenses
  clientDetails.fullIncomeExpenses.unlinked.forEach(item => {
    const row = createIncomeExpenseRow(item, false);
    row.originalItem = item;
    tableBody.appendChild(row);
  });
}




function handleIncomeExpensesPage() {
  console.log('Client Details:', JSON.stringify(clientDetails, null, 2));
  
  updateIncomeExpensesTable();

  const addNewBtn = document.querySelector(".add-new");
  if (addNewBtn) {
    addNewBtn.addEventListener("click", () => {
      const newItem = {
        type: "Income",
        concept: "",
        amount: 0,
        frequency: "Monthly",
        assetName: "None"
      };
      clientDetails.fullIncomeExpenses.unlinked.push(newItem);
      saveClientDetails();
      updateIncomeExpensesTable(); // Refresh the table after adding a new item
    });
  }

  const doneBtn = document.querySelector(".done-btn");
  if (doneBtn) {
    doneBtn.addEventListener("click", () => {
      window.location.href = "./main-menu.html";
    });
  }
}

function deleteIncomeExpenseRow(row, type, item) {
  const index = clientDetails.fullIncomeExpenses[type].findIndex(i => i === item);
>>>>>>> f2104fb85038938d4a31af6a4feb63a00d6523be
  if (index > -1) {
    clientDetails.fullIncomeExpenses[type].splice(index, 1);
    saveClientDetails();
  }
  row.remove();
}

<<<<<<< HEAD
/*********** CHART RELATED STUFF ***************/
const chartOptions = {
  chart: {
    type: "donut",
  },
  colors: [
    "#7695FF", // Soft Blue
    "#9DBDFF", // Light Blue
    "#FFD7C4", // Peach
    "#FF9874", // Coral
    "#6A84E6", // Medium Blue (Deeper shade of Soft Blue)
    "#B2CDFF", // Pale Blue (Lighter shade of Light Blue)
    "#FFCBB2", // Light Peach (Lighter shade of Peach)
    "#FF8564", // Deep Coral (Deeper shade of Coral)
    "#A2B6FF", // Lavender Blue (Tint of Soft Blue)
    "#FFAF92", // Light Coral (Tint of Coral)
  ],

  plotOptions: {
    pie: {
      donut: {
        size: "80%",
        background: "transparent",
        labels: {
          show: true,
          name: {
            show: false,
            fontSize: "22px",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontWeight: 600,
            color: undefined,
            offsetY: -10,
            formatter: function (val) {
              return val;
            },
          },
          value: {
            show: true,
            fontSize: "16px",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontWeight: 400,
            color: undefined,
            offsetY: 16,
            formatter: function (val) {
              return val;
            },
          },
          total: {
            show: true,
            showAlways: true,
            label: "Total",
            fontSize: "22px",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontWeight: 600,
            color: "#373d3f",
            formatter: function (w) {
              return w.globals.seriesTotals.reduce((a, b) => {
                return a + b;
              }, 0);
            },
          },
        },
      },
    },
  },
};
const chartOptionsTotal = {
  chart: {
    type: "donut",
  },
  colors: [
    "#101326", // Dark Blue
    "#5280AC", // Light Blue
    "#0D4B72", // Deep Blue (Accent)
    "#7BA0C2", // Light Blue Shade (Accent)
    "#262310", // Dark Olive (Complementary to Dark Blue)
    "#AC8252", // Warm Brown (Complementary to Light Blue)
    "#FF7F50", // Coral (Accent)
    "#DDDFED", // Lavender Gray (Complementary to Cream)
    "#EDE3DD", // Cream
    "#4A4A4A", // Charcoal (Neutral)
    "#C1C1C1", // Light Gray (Neutral)
  ],
  plotOptions: {
    pie: {
      donut: {
        size: "80%",
        background: "transparent",
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: "22px",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontWeight: 600,
            color: undefined,
            offsetY: -10,
            formatter: function (val) {
              return val;
            },
          },
          value: {
            show: true,
            fontSize: "16px",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontWeight: 400,
            color: undefined,
            offsetY: 16,
            formatter: function (val) {
              return val;
            },
          },
          total: {
            show: true,
            showAlways: true,
            label: "Total",
            fontSize: "22px",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontWeight: 600,
            color: "#373d3f",
            formatter: function (w) {
              return w.globals.seriesTotals.reduce((a, b) => {
                return a + b;
              }, 0);
            },
          },
        },
      },
    },
  },
};

function organizeTotalAssetData(assets) {
  const assetData = [];

  // Loop through each asset category
  for (const category in assets) {
    if (assets.hasOwnProperty(category)) {
      // Loop through each asset in the category
      assets[category].forEach((asset) => {
        const assetName = asset.name || asset.fundOrCompanyName;
        const value = parseFloat(asset.value || asset.investmentValue || 0);

        // Push the relevant information to the array
        assetData.push({
          value: value,
          assetName: assetName,
          category: category,
        });
      });
    }
  }

  return assetData;
}

function prepareTotalChartData(organizedData) {
  const series = [];
  const labels = [];
  const colors = {
    realEstate: "#FF4560", // example color for real estate
    privateEquity: "#00E396", // example color for private equity
    nicheAssets: "#008FFB", // example color for niche assets
    financialAssetsWithOtherAdvisors: "#FEB019", // example color for other assets
  };
  const chartColors = [];

  organizedData.forEach((asset) => {
    series.push(asset.value);
    labels.push(asset.assetName);
    chartColors.push(colors[asset.category] || "#333"); // Default color if category is not found
  });

  return { series, labels, chartColors };
}

function calculateRealEstateValues(realEstateAssets) {
  const totals = {
    total: 0,
    residential: 0,
    commercial: 0,
    land: 0,
    industrial: 0,
  };

  realEstateAssets.forEach((asset) => {
    const value = parseFloat(asset.value || 0);
    totals.total += value;

    switch (asset.type) {
      case "residential":
        totals.residential += value;
        break;
      case "commercial":
        totals.commercial += value;
        break;
      case "land":
        totals.land += value;
        break;
      case "industrial":
        totals.industrial += value;
        break;
      default:
        break;
    }
  });

  return totals;
}

function prepareRealEstateChartData(realEstateAssets) {
  const chartData = {
    total: {
      series: [],
      labels: [],
    },
    residential: {
      series: [],
      labels: [],
    },
    commercial: {
      series: [],
      labels: [],
    },
    land: {
      series: [],
      labels: [],
    },
    industrial: {
      series: [],
      labels: [],
    },
  };

  realEstateAssets.forEach((asset) => {
    const value = parseFloat(asset.value || 0);
    const assetName = asset.name || "Unnamed Asset";

    chartData.total.series.push(value);
    chartData.total.labels.push(assetName);

    switch (asset.type) {
      case "residential":
        chartData.residential.series.push(value);
        chartData.residential.labels.push(assetName);
        break;
      case "commercial":
        chartData.commercial.series.push(value);
        chartData.commercial.labels.push(assetName);
        break;
      case "land":
        chartData.land.series.push(value);
        chartData.land.labels.push(assetName);
        break;
      case "industrial":
        chartData.industrial.series.push(value);
        chartData.industrial.labels.push(assetName);
        break;
      default:
        break;
    }
  });

  return chartData;
}

function renderRealEstateCharts(realEstateChartData) {
  // Total Real Estate Value
  new ApexCharts(document.querySelector("#real-estate-total-value-chart"), {
    ...chartOptionsTotal,
    title: { text: "Real Estate Total" },
    series: realEstateChartData.total.series,
    labels: realEstateChartData.total.labels,
  }).render();

  // Residential Value
  new ApexCharts(document.querySelector("#residential-value-chart"), {
    ...chartOptions,
    title: { text: "Residential" },
    series: realEstateChartData.residential.series,
    labels: realEstateChartData.residential.labels,
  }).render();

  // Commercial Value
  new ApexCharts(document.querySelector("#commercial-value-chart"), {
    ...chartOptions,
    title: { text: "Commerial" },
    series: realEstateChartData.commercial.series,
    labels: realEstateChartData.commercial.labels,
  }).render();

  // Land Value
  new ApexCharts(document.querySelector("#land-value-chart"), {
    ...chartOptions,
    title: { text: "Land" },
    series: realEstateChartData.land.series,
    labels: realEstateChartData.land.labels,
  }).render();

  // Industrial Value
  new ApexCharts(document.querySelector("#industrial-value-chart"), {
    ...chartOptions,
    title: { text: "Industrial" },
    series: realEstateChartData.industrial.series,
    labels: realEstateChartData.industrial.labels,
  }).render();
}

function calculatePrivateEquityValues(privateEquityAssets) {
  const totals = {
    total: 0,
    fund: [],
    investment: [],
    ownCompany: [],
  };

  privateEquityAssets.forEach((asset) => {
    const value = parseFloat(asset.investmentValue || 0);
    totals.total += value;

    switch (asset.type) {
      case "fund":
        totals.fund.push({
          name: asset.fundOrCompanyName,
          value: value,
        });
        break;
      case "investment":
        totals.investment.push({
          name: asset.fundOrCompanyName,
          value: value,
        });
        break;
      case "ownCompany":
        totals.ownCompany.push({
          name: asset.fundOrCompanyName,
          value: value,
        });
        break;
      default:
        break;
    }
  });

  return totals;
}

function preparePrivateEquityChartData(privateEquityTotals) {
  return {
    total: {
      series: privateEquityTotals.fund
        .concat(privateEquityTotals.investment, privateEquityTotals.ownCompany)
        .map((item) => item.value),
      labels: privateEquityTotals.fund
        .concat(privateEquityTotals.investment, privateEquityTotals.ownCompany)
        .map((item) => item.name),
    },
    fund: {
      series: privateEquityTotals.fund.map((item) => item.value),
      labels: privateEquityTotals.fund.map((item) => item.name),
    },
    investment: {
      series: privateEquityTotals.investment.map((item) => item.value),
      labels: privateEquityTotals.investment.map((item) => item.name),
    },
    ownCompany: {
      series: privateEquityTotals.ownCompany.map((item) => item.value),
      labels: privateEquityTotals.ownCompany.map((item) => item.name),
    },
  };
}

function renderPrivateEquityCharts(privateEquityChartData) {
  // Total Private Equity Value
  new ApexCharts(document.querySelector("#private-equity-total-value-chart"), {
    ...chartOptionsTotal,
    title: { text: "Private Equity Total" },
    series: privateEquityChartData.total.series,
    labels: privateEquityChartData.total.labels,
  }).render();

  // Fund Value
  new ApexCharts(document.querySelector("#fund-value-chart"), {
    ...chartOptions,
    title: { text: "Private Funds" },
    series: privateEquityChartData.fund.series,
    labels: privateEquityChartData.fund.labels,
  }).render();

  // Investment Value
  new ApexCharts(document.querySelector("#investment-value-chart"), {
    ...chartOptions,
    title: { text: "Investments" },
    series: privateEquityChartData.investment.series,
    labels: privateEquityChartData.investment.labels,
  }).render();

  // Own Company Value
  new ApexCharts(document.querySelector("#ownCompany-value-chart"), {
    ...chartOptions,
    title: { text: "Own Company" },
    series: privateEquityChartData.ownCompany.series,
    labels: privateEquityChartData.ownCompany.labels,
  }).render();
}

function calculateNicheAssetsValues(nicheAssets) {
  const totals = {
    total: 0,
    luxuryVehicle: [],
    art: [],
    otherCollection: [],
  };

  nicheAssets.forEach((asset) => {
    const value = parseFloat(asset.value || 0);
    totals.total += value;

    switch (asset.type) {
      case "luxuryVehicle":
        totals.luxuryVehicle.push({
          name: asset.name,
          value: value,
        });
        break;
      case "art":
        totals.art.push({
          name: asset.name,
          value: value,
        });
        break;
      case "otherCollection":
        totals.otherCollection.push({
          name: asset.name,
          value: value,
        });
        break;
      default:
        break;
    }
  });

  return totals;
}

function prepareNicheAssetsChartData(nicheAssetsTotals) {
  return {
    total: {
      series: nicheAssetsTotals.luxuryVehicle
        .concat(nicheAssetsTotals.art, nicheAssetsTotals.otherCollection)
        .map((item) => item.value),
      labels: nicheAssetsTotals.luxuryVehicle
        .concat(nicheAssetsTotals.art, nicheAssetsTotals.otherCollection)
        .map((item) => item.name),
    },
    luxuryVehicle: {
      series: nicheAssetsTotals.luxuryVehicle.map((item) => item.value),
      labels: nicheAssetsTotals.luxuryVehicle.map((item) => item.name),
    },
    art: {
      series: nicheAssetsTotals.art.map((item) => item.value),
      labels: nicheAssetsTotals.art.map((item) => item.name),
    },
    otherCollection: {
      series: nicheAssetsTotals.otherCollection.map((item) => item.value),
      labels: nicheAssetsTotals.otherCollection.map((item) => item.name),
    },
  };
}

function renderNicheAssetsCharts(nicheAssetsChartData) {
  // Total Niche Assets Value
  new ApexCharts(document.querySelector("#niche-total-value-chart"), {
    ...chartOptionsTotal,
    title: { text: "Niche Assets Total" },
    series: nicheAssetsChartData.total.series,
    labels: nicheAssetsChartData.total.labels,
  }).render();

  // Luxury Vehicle Value
  new ApexCharts(document.querySelector("#luxuryVehicle-value-chart"), {
    ...chartOptions,
    title: { text: "Luxury Vehicles" },
    series: nicheAssetsChartData.luxuryVehicle.series,
    labels: nicheAssetsChartData.luxuryVehicle.labels,
  }).render();

  // Art Value
  new ApexCharts(document.querySelector("#art-value-chart"), {
    ...chartOptions,
    title: { text: "Art" },
    series: nicheAssetsChartData.art.series,
    labels: nicheAssetsChartData.art.labels,
  }).render();

  // Other Collection Value
  new ApexCharts(document.querySelector("#otherCollection-value-chart"), {
    ...chartOptions,
    title: { text: "Other Collections" },
    series: nicheAssetsChartData.otherCollection.series,
    labels: nicheAssetsChartData.otherCollection.labels,
  }).render();
}

/*********** CALCULATIONS **************** */

function calculateTotalValue(assets) {
  let totalValue = 0;
  for (let category in assets) {
    for (let asset of assets[category]) {
      if (asset.value) totalValue += parseFloat(asset.value);
      if (asset.investmentValue)
        totalValue += parseFloat(asset.investmentValue);
    }
  }
  return totalValue;
}

function calculateTotalCatValue(assetCategory) {
  let totalValue = 0;

  assetCategory.forEach((asset) => {
    if (asset.investmentValue) {
      totalValue += parseFloat(asset.investmentValue);
    } else if (asset.value) {
      totalValue += parseFloat(asset.value);
    }
  });

  return totalValue;
}

function calculateNetIncome(fullIncomeExpenses) {
  let totalIncome = 0,
    totalExpenses = 0;

  function processIncomeExpense(incomeExpenseArray, isIncome) {
    for (let entry of incomeExpenseArray) {
      let amount = parseFloat(entry.amount);
      if (entry.frequency === "Monthly") amount *= 12;
      if (isIncome) {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }
    }
  }

  processIncomeExpense(
    fullIncomeExpenses.linked.filter((e) => e.type === "Income"),
    true
  );
  processIncomeExpense(
    fullIncomeExpenses.unlinked.filter((e) => e.type === "Income"),
    true
  );
  processIncomeExpense(
    fullIncomeExpenses.linked.filter((e) => e.type === "Expense"),
    false
  );

  return totalIncome - totalExpenses;
}

function calculateReturnOnAssets(assets, fullIncomeExpenses) {
  let incomeFromAssets = 0,
    expensesFromAssets = 0,
    incomeProducingAssetValue = 0;

  const linkedIncomes = fullIncomeExpenses.linked.filter(
    (e) => e.type === "Income"
  );
  const linkedExpenses = fullIncomeExpenses.linked.filter(
    (e) => e.type === "Expense"
  );

  for (let assetType in assets) {
    for (let asset of assets[assetType]) {
      let assetValue = asset.value || asset.investmentValue || 0;
      let hasIncome = linkedIncomes.some(
        (income) =>
          income.assetName === asset.name ||
          income.assetName === asset.assetName
      );

      if (hasIncome) {
        incomeProducingAssetValue += parseFloat(assetValue);
        incomeFromAssets += linkedIncomes
          .filter(
            (income) =>
              income.assetName === asset.name ||
              income.assetName === asset.assetName
          )
          .reduce(
            (sum, income) =>
              sum +
              (income.frequency === "Monthly"
                ? parseFloat(income.amount) * 12
                : parseFloat(income.amount)),
            0
          );
        expensesFromAssets += linkedExpenses
          .filter(
            (expense) =>
              expense.assetName === asset.name ||
              expense.assetName === asset.assetName
          )
          .reduce(
            (sum, expense) =>
              sum +
              (expense.frequency === "Monthly"
                ? parseFloat(expense.amount) * 12
                : parseFloat(expense.amount)),
            0
          );
      }
    }
  }

  return (incomeFromAssets - expensesFromAssets) / incomeProducingAssetValue;
}

function hasData(assetArray) {
  return assetArray && assetArray.length > 0;
}

function hideEmptyAssetContainers(clientDetails) {
  const realEstateTypes = ["residential", "commercial", "land", "industrial"];
  const privateEquityTypes = ["fund", "investment", "ownCompany"];
  const nicheAssetTypes = ["luxuryVehicle", "art", "otherCollection"];

  // Check Real Estate
  realEstateTypes.forEach((type) => {
    const exists = clientDetails.assets.realEstate.some(
      (asset) => asset.type === type
    );
    document.getElementById(`${type}-value-chart`).closest(".inner-col-child").style.display =
      exists ? "block" : "none";
  });

  // Check Private Equity
  privateEquityTypes.forEach((type) => {
    const exists = clientDetails.assets.privateEquity.some(
      (asset) => asset.type === type
    );
    document.getElementById(`${type}-value-chart`).closest(".inner-col-child").style.display =
      exists ? "block" : "none";
  });

  // Check Niche Assets
  nicheAssetTypes.forEach((type) => {
    const exists = clientDetails.assets.nicheAssets.some(
      (asset) => asset.type === type
    );
    document.getElementById(`${type}-value-chart`).closest(".inner-col-child").style.display =
      exists ? "block" : "none";
  });
}

function backToMain(){
   window.location.href = "./main-menu.html"
}

function handleMyResults() {
  // fill kpi cards
  const totalValue = calculateTotalValue(clientDetails.assets).toLocaleString(
    "en",
    { useGrouping: true }
  );
  const realEstateTotal = calculateTotalCatValue(
    clientDetails.assets.realEstate
  ).toLocaleString("en", { useGrouping: true });
  const privateEquityTotal = calculateTotalCatValue(
    clientDetails.assets.privateEquity
  ).toLocaleString("en", { useGrouping: true });
  const nicheAssetsTotal = calculateTotalCatValue(
    clientDetails.assets.nicheAssets
  ).toLocaleString("en", { useGrouping: true });

  const netIncome = calculateNetIncome(
    clientDetails.fullIncomeExpenses
  ).toLocaleString("en", { useGrouping: true });
  const returnOnAssets = calculateReturnOnAssets(
    clientDetails.assets,
    clientDetails.fullIncomeExpenses
  )
    .toPrecision(4)
    .toLocaleString("en", { useGrouping: true });

  document.getElementById("total-value-text").textContent = totalValue;
  document.getElementById("re-total-value-text").textContent = realEstateTotal;
  document.getElementById("pe-total-value-text").textContent =
    privateEquityTotal;
  document.getElementById("na-total-value-text").textContent = nicheAssetsTotal;
  document.getElementById("net-income-text").textContent = netIncome;
  document.getElementById("roa-text").textContent = returnOnAssets;

  const organizedData = organizeTotalAssetData(clientDetails.assets);
  const chartData = prepareTotalChartData(organizedData);

  let totalOptions = {
    chart: {
      type: "donut",
    },
    colors: [
      "#101326", // Dark Blue
      "#5280AC", // Light Blue
      "#0D4B72", // Deep Blue (Accent)
      "#7BA0C2", // Light Blue Shade (Accent)
      "#262310", // Dark Olive (Complementary to Dark Blue)
      "#AC8252", // Warm Brown (Complementary to Light Blue)
      "#FF7F50", // Coral (Accent)
      "#DDDFED", // Lavender Gray (Complementary to Cream)
      "#EDE3DD", // Cream
      "#4A4A4A", // Charcoal (Neutral)
      "#C1C1C1", // Light Gray (Neutral)
    ],
    plotOptions: {
      pie: {
        donut: {
          size: "80%",
          background: "transparent",

          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "22px",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 600,
              color: undefined,
              offsetY: -10,
              formatter: function (val) {
                return val;
              },
            },
            value: {
              show: true,
              fontSize: "16px",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 400,
              color: undefined,
              offsetY: 16,
              formatter: function (val) {
                return val;
              },
            },
            total: {
              show: true,
              showAlways: true,
              label: "Total",
              fontSize: "22px",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 600,
              color: "#373d3f",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => {
                  return a + b;
                }, 0);
              },
            },
          },
        },
      },
    },
    title: { text: "Total value of all assets" },
    series: chartData.series,
    labels: chartData.labels,
    // colors: chartData.chartColors,
  };

  let chart = new ApexCharts(
    document.querySelector("#total-value-chart"),
    totalOptions
  );
  chart.render();

  if (hasData(clientDetails.assets.realEstate)) {
    // Render real estate card
    const realEstateAssets = clientDetails.assets.realEstate;
    const realEstateChartData = prepareRealEstateChartData(realEstateAssets);

    renderRealEstateCharts(realEstateChartData);
  }

  if (hasData(clientDetails.assets.privateEquity)) {
    // Render private equity card
    const privateEquityAssets = clientDetails.assets.privateEquity;
    const privateEquityTotals =
      calculatePrivateEquityValues(privateEquityAssets);
    const privateEquityChartData =
      preparePrivateEquityChartData(privateEquityTotals);
    renderPrivateEquityCharts(privateEquityChartData);
  }
  if (hasData(clientDetails.assets.nicheAssets)) {
    // Render niche assets card
    const nicheAssets = clientDetails.assets.nicheAssets;
    const nicheAssetsTotals = calculateNicheAssetsValues(nicheAssets);
    const nicheAssetsChartData = prepareNicheAssetsChartData(nicheAssetsTotals);
    renderNicheAssetsCharts(nicheAssetsChartData);
  }

  hideEmptyAssetContainers(clientDetails);
}

// You can add any additional utility functions or global event listeners here if needed
=======




>>>>>>> f2104fb85038938d4a31af6a4feb63a00d6523be

// End of script

// clearAllLocalStorage()