document.addEventListener("DOMContentLoaded", function () {
    let currentCurrency = localStorage.getItem("currentCurrencyExtension") || "usd"; // Default currency
    let apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc`;

    const fetchCryptoData = () => {
        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                showCryptoData(data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                displayError();
            });
    };

    const showCryptoData = (coins) => {
        const coinsContainer = document.getElementById("coins-container");
        coinsContainer.innerHTML = ""; // Clear previous content

        if (coins?.length === 0) {
            displayNoData();
            return;
        }

        coins?.forEach((coin) => {
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
            priceCell.textContent = `${
                currentCurrency === "usd" ? "$" : "€"
            }${new Intl.NumberFormat().format(coin.current_price.toFixed(2))}`;

            const priceChangeCell = document.createElement("td");
            priceChangeCell.textContent =
                coin.price_change_percentage_24h.toFixed(2) + "%";
            priceChangeCell.classList.add("price-change");
            if (coin.price_change_percentage_24h < 0) {
                priceChangeCell.classList.add("negative");
            }

            row.appendChild(imageAndNameCell);
            row.appendChild(priceCell);
            row.appendChild(priceChangeCell);

            coinsContainer.appendChild(row);
        });
    };

    const displayNoData = () => {
        const coinsContainer = document.getElementById("coins-container");
        coinsContainer.innerHTML = "<tr><td colspan='3'>No data available</td></tr>";
    };

    const displayError = () => {
        const coinsContainer = document.getElementById("coins-container");
        coinsContainer.innerHTML = "<tr><td colspan='3'>Error fetching data</td></tr>";
    };

    fetchCryptoData();

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

    const changeCurrencySelect = document.getElementById("change-currency-select");
    changeCurrencySelect.value = currentCurrency;
    changeCurrencySelect.addEventListener("change", function () {
        currentCurrency = this.value;
        apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc`;
        localStorage.setItem("currentCurrencyExtension", currentCurrency); 
        fetchCryptoData();

        searchInput.value = "";
    });
});
