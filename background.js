document.addEventListener("DOMContentLoaded", function () {
  let currentCurrency =
    localStorage.getItem("currentCurrencyExtension") || "usd"; // Default currency
  let apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc`;
  let allCoins = [];

  const fetchCryptoData = () => {
    const storedData = JSON.parse(
      localStorage.getItem(`cryptoData_${currentCurrency}`)
    );
    if (storedData && Date.now() - storedData?.timestamp < 5 * 60 * 1000) {
      // Use cached data if not expired
      allCoins = storedData.data;
      showAllCoins();
    } else {
      // Fetch new data from API
      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          allCoins = data;
          localStorage.setItem(
            `cryptoData_${currentCurrency}`,
            JSON.stringify({ data: data, timestamp: Date.now() })
          );
          showAllCoins();
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          displayError();
        });
    }
  };

  const showAllCoins = () => {
    const coinsContainer = document.getElementById("coins-container");
    coinsContainer.innerHTML = ""; // Clear previous content

    if (allCoins.length === 0) {
      displayNoData();
      return;
    }

    allCoins.forEach((coin) => {
      const row = createCoinRow(coin);
      coinsContainer.appendChild(row);
    });
  };

  const showFavoriteCoins = () => {
    const favoriteCoins =
      JSON.parse(localStorage.getItem("favoriteCoins")) || [];
    const filteredCoins = allCoins.filter((coin) =>
      favoriteCoins.includes(coin.id)
    );
    const coinsContainer = document.getElementById("coins-container");
    coinsContainer.innerHTML = ""; // Clear previous content

    if (filteredCoins.length === 0) {
      displayNoData();
      return;
    }

    filteredCoins.forEach((coin) => {
      const row = createCoinRow(coin);
      coinsContainer.appendChild(row);
    });
  };

  const createCoinRow = (coin) => {
    const row = document.createElement("tr");

    const imageAndNameCell = document.createElement("td");
    const imageAndNameDiv = document.createElement("div");
    imageAndNameDiv.classList.add("image-and-name");
    imageAndNameCell.appendChild(imageAndNameDiv);

    const image = document.createElement("img");
    image.src = coin.image;
    image.alt = coin.name;
    image.classList.add("coin-image");

    const name = document.createElement("span");
    name.textContent = coin.name;

    imageAndNameDiv.appendChild(image);
    imageAndNameDiv.appendChild(name);

    const priceCell = document.createElement("td");
    priceCell.textContent = `${getCurrencySymbol(
      currentCurrency
    )}${coin.current_price.toFixed(2)}`;

    const priceChangeCell = document.createElement("td");
    priceChangeCell.textContent = `${coin.price_change_percentage_24h.toFixed(
      2
    )}%`;
    priceChangeCell.classList.add("price-change");
    if (coin.price_change_percentage_24h < 0) {
      priceChangeCell.classList.add("negative");
    }

    const favoriteCell = document.createElement("td");
    const favoriteButton = document.createElement("div");
    favoriteButton.classList.add("favorite-button");

    // Check if the coin is a favorite
    const favoriteCoins =
      JSON.parse(localStorage.getItem("favoriteCoins")) || [];
    const isFavorite = favoriteCoins.includes(coin.id);

    // Create SVG heart icon
    const heartSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${
      isFavorite ? "red" : "none"
    }" stroke="${
      isFavorite ? "none" : "red"
    }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 4.5a5.36 5.36 0 0 0-7.55 0L12 5.94l-1.45-1.45a5.36 5.36 0 0 0-7.55 7.55L12 21l8.45-8.45a5.36 5.36 0 0 0 0-7.55z"></path>
    </svg>
  `;

    favoriteButton.innerHTML = heartSVG;
    favoriteButton.addEventListener("click", function () {
      toggleFavorite(coin.id);
      // Toggle heart color and border color after clicking
      favoriteButton.innerHTML = isFavorite ? emptyHeartSVG : heartSVG;
    });

    favoriteCell.appendChild(favoriteButton);

    row.appendChild(imageAndNameCell);
    row.appendChild(priceCell);
    row.appendChild(priceChangeCell);
    row.appendChild(favoriteCell);

    return row;
  };

  const displayNoData = () => {
    const coinsContainer = document.getElementById("coins-container");
    coinsContainer.innerHTML =
      "<tr><td colspan='4'>No data available</td></tr>";
  };

  const displayError = () => {
    const coinsContainer = document.getElementById("coins-container");
    coinsContainer.innerHTML =
      "<tr><td colspan='4'>Error fetching data</td></tr>";
  };

  const toggleFavorite = (coinId) => {
    let favoriteCoins = JSON.parse(localStorage.getItem("favoriteCoins")) || [];
    const index = favoriteCoins.indexOf(coinId);
    if (index === -1) {
      favoriteCoins.push(coinId);
    } else {
      favoriteCoins.splice(index, 1);
    }
    localStorage.setItem("favoriteCoins", JSON.stringify(favoriteCoins));

    // Update displayed coins based on the current active tab
    const allCoinsTab = document.getElementById("all-coins-tab");
    if (allCoinsTab.classList.contains("active-tab")) {
      showAllCoins();
    } else {
      showFavoriteCoins();
    }
  };

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case "usd":
        return "$";
      case "eur":
        return "€";
      case "jpy":
        return "¥";
      case "rub":
        return "₽";
      case "cny":
        return "¥";
      default:
        return "";
    }
  };

  fetchCryptoData();

  const allCoinsTab = document.getElementById("all-coins-tab");
  const favoriteCoinsTab = document.getElementById("favorite-coins-tab");

  allCoinsTab.addEventListener("click", function () {
    allCoinsTab.classList.add("active-tab");
    favoriteCoinsTab.classList.remove("active-tab");
    showAllCoins();
  });

  favoriteCoinsTab.addEventListener("click", function () {
    favoriteCoinsTab.classList.add("active-tab");
    allCoinsTab.classList.remove("active-tab");
    showFavoriteCoins();
  });
  
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", function () {
    const searchText = this.value.toLowerCase();
    const coinRows = document.querySelectorAll("#coins-container tr");
    coinRows.forEach((row) => {
      const coinName = row
        .querySelector(".image-and-name span")
        .textContent.toLowerCase();
      if (coinName.includes(searchText)) {
        row.style.display = "table-row";
      } else {
        row.style.display = "none";
      }
    });
  });

  const changeCurrencySelect = document.getElementById(
    "change-currency-select"
  );
  changeCurrencySelect.value = currentCurrency;
  changeCurrencySelect.addEventListener("change", function () {
    currentCurrency = this.value;
    apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc`;
    localStorage.setItem("currentCurrencyExtension", currentCurrency);
    fetchCryptoData();
  });

  // Dark mode logic
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const darkModeEnabled = localStorage.getItem("darkModeEnabled") === "true";
  darkModeToggle.checked = darkModeEnabled;
  document.body.classList.toggle("dark-mode", darkModeEnabled);

  darkModeToggle.addEventListener("change", function () {
    const darkModeEnabled = this.checked;
    document.body.classList.toggle("dark-mode", darkModeEnabled);
    localStorage.setItem("darkModeEnabled", darkModeEnabled);
  });
});
