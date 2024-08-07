class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl, currencies) {
        this.apiUrl = apiUrl;
        this.currencies = [];
    }

    getCurrencies() {
        return fetch(`${this.apiUrl}/currencies`)
        .then(response => response.json())
        .then(data => {
            this.currencies = Object.keys(data).map(code => new Currency(code, data[code])) //convierte cada par clave-valor en un objeto corrency
        })
        .catch( err => console.error('Error:', err));
    }

    convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency.code === toCurrency.code) {
            const convertedAmount = parseFloat(amount);
            return convertedAmount;
        } else {
            return fetch(`${this.apiUrl}/latest?base=${fromCurrency.code}&symbols=${toCurrency.code}`)
            .then(response => response.json())
            .then(data => {
                const rate = data.rates[toCurrency.code];
                if (rate !== undefined) {
                    const convertedAmount = amount * rate;
                    return convertedAmount;
                } else {
                    console.error('Tasa de conversion no encontrada');
                    return null;
                }
            })
            .catch(err => {
                console.error('Error:', err);
                return null;
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
