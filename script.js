/* 
    CSC6304 Week 5 Project 4
    Alexander Medeiros 11/26/2024

    This file contains javascript methods which handle the interactive aspects of the html index homepage 

    CoinCap 2.0 RESTful API documentation: https://docs.coincap.io/#ee30bea9-bb6b-469d-958a-d3e35d442d7a

    Chart.js Documentation: https://www.chartjs.org/docs/latest/

*/

// Method to hide terms
function accept_Terms() {
    var T = document.getElementById("Terms");
    T.style.display = "none";

    var T = document.getElementById("accept_Terms");
    T.style.display = "block";
}

// Method to plot crpyto trends using info from CoinCap and visualization from chart.js
let ChartInstance; // Store the chart instance

async function show_chart(interval='d1') { // Set default chart internal to 'd1'
    
    var T = document.getElementById("chart");
    T.style.display = "block";  // show chart

    // Clear any previous chart status message
    const chartStatusElement = document.getElementById("chartStatus");
    chartStatusElement.innerText = "Loading chart..."; 

    const { time, priceList , coinName} = await get_Query(interval); // Query the CoinCap api for the specified coin

    // Destroy the old chart if it exists
    if (ChartInstance) {
        ChartInstance.destroy();
    }

    // Create the chart
    ChartInstance = new Chart("myChart", {
        type: "line",
        data: { labels: time, // x-axis: time output from query
                datasets: [{
                    label: coinName + " Price (USD)", // Label for the title
                    backgroundColor: "rgba(16, 136, 32, 0.1)", // Line fill color, set to transparent
                    borderColor: "rgba(21, 119, 34, 1)", // Line border color
                    data: priceList, // y-axis: crypto price from query
                    fill: true, // Fill the area under the line
                    tension: 0.3 // Line smoothing adjustment
                    }]
        },
        options: { responsive: true, // Makes the chart responsive to window resizing
                    plugins: { legend: {
                                display: true // Display the legend
                                },
                                title: {
                                display: true, // Show the title
                                text: "Crypto Price Over Time" // Title of the chart
                                }
                            },
                                scales: {
                                x: { title: {
                                     display: true,
                                     text: 'Date' // Label for the x-axis (time)
                                    }
                                },
                                y: { title: {
                                     display: true,
                                     text: 'Price (USD)' // Label for the y-axis (price)
                                    },
                                ticks: { beginAtZero: false // Prevent y-axis from starting at zero
                                    }
                                }
                            }
                    }
    });
    chartStatusElement.innerText = ""; // Clear status message when chart is ready
}

// Method to obtain the top crypto prices values obtained from the CoinCap API
async function get_Query(interval) {
    const cryptoId = document.getElementById("cryptoName").value.toLowerCase(); // Obtain the query input as lowercase
    
    const outputElement = document.getElementById("chartStatus"); // Chart status

    // Clear previous status message
    outputElement.innerText = "Loading data..."; // Loading prompt

    try {
        // URL for CoinCap API request
        const url_CoinCap = `https:// rest.coincap.io/v3/assets/${cryptoId}/history?interval=${interval}`;

        // Fetch data from API
        const response = await fetch(url_CoinCap);

        // Check if the response is ok
        if (!response.ok) {
            throw new Error(`Request error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const cryptoPriceData = await response.json();
        const data = cryptoPriceData.data; // Initialize at first parent key

        // Initialize arrays for storing prices and time
        const priceList = [];
        const time = [];

        // Iterate through data and extract price and time values
        for (const interval of data) {
            priceList.push(interval.priceUsd); // Access priceUsd from each time interval
            time.push(new Date(interval.time).toLocaleDateString()); // Format time as a readable date
        }

        // Return the extracted data
        return { time, priceList , coinName: String(cryptoId).charAt(0).toUpperCase() + String(cryptoId).slice(1)};

    } catch (error) {
        // Handle errors
        console.error("Error fetching information:", error);
        if (outputElement) {
            outputElement.innerText = "Error fetching information."; // Display error message
        }
    }
}

// Method to obtain the top crpyto prices values obtained from the CoinCap api 
async function get_Top() {
    try {const url_CoinCap = `https:// rest.coincap.io/v3/assets`; // URL for CoinCap api request

        const response = await fetch(url_CoinCap);
        if (!response.ok) {
            throw new Error(`Request error! Status: ${response.status}`);
        }
        let output = ""
        const cryptoPriceData = await response.json(); // Parse the JSON response
        const data = cryptoPriceData.data; // Initialize at first parent key

        // Iterate through each key and construct the output string
        for (const key of data) {
            const crypto_name = key.name;
            const rank = key.rank;
            const symbol = key.symbol;

            const price= key.priceUsd;
            const priceFloat = parseFloat(price)
            const roundedPrice = priceFloat.toFixed(2)

            const percent_change = key.changePercent24Hr;
            const changeFloat = parseFloat(percent_change)
            const rounded_change = changeFloat.toFixed(2)
            let color = "green"
            if (rounded_change < 0) {
                color = "#cb2b2b"
            };

            const explorer = key.explorer;
           
            // Append the formatted string to output
            output += `
                <hr>
                <h3><u>${crypto_name}, Rank ${rank}</u></h3>
                <p>&emsp;Symbol: ${symbol} Price: $${roundedPrice}</p>
                <p style = "background-color:${color}; display: inline;">&emsp;${rounded_change}% change (24HR)</p>
                <p>&emsp;Link: <a href="${explorer}" title ="">${explorer}</a> </p>
             
            `;
        }

        // Display the output
        document.getElementById("outputData").innerHTML = output; 

    } catch (error) {
        console.error("Error fetching information:", error);
        document.getElementById("outputData").innerText = "Error fetching information.";
    }
}
window.get_prices = get_Top;
