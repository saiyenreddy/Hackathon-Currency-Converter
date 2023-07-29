const dropList = document.querySelectorAll("form select"),
fromCurrency = document.querySelector(".from select"),
toCurrency = document.querySelector(".to select"),
getButton = document.querySelector("form button");

for (let i = 0; i < dropList.length; i++) {
    for(let currency_code in country_list){
        // selecting USD by default as FROM currency and NPR as TO currency
        let selected = i == 0 ? currency_code == "USD" ? "selected" : "" : currency_code == "NPR" ? "selected" : "";
        // creating option tag with passing currency code as a text and value
        let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
        // inserting options tag inside select tag
        dropList[i].insertAdjacentHTML("beforeend", optionTag);
    }
    dropList[i].addEventListener("change", e =>{
        loadFlag(e.target); // calling loadFlag with passing target element as an argument
    });
}

function loadFlag(element){
    for(let code in country_list){
        if(code == element.value){ // if currency code of country list is equal to option value
            let imgTag = element.parentElement.querySelector("img"); // selecting img tag of particular drop list
            // passing country code of a selected currency code in a img url
            imgTag.src = `https://flagcdn.com/48x36/${country_list[code].toLowerCase()}.png`;
        }
    }
}


window.addEventListener("load", ()=>{
    getExchangeRate();
});

getButton.addEventListener("click", e =>{
    e.preventDefault(); //preventing form from submitting
    getExchangeRate();
});

const exchangeIcon = document.querySelector("form .icon");
exchangeIcon.addEventListener("click", ()=>{
    let tempCode = fromCurrency.value; // temporary currency code of FROM drop list
    fromCurrency.value = toCurrency.value; // passing TO currency code to FROM currency code
    toCurrency.value = tempCode; // passing temporary currency code to TO currency code
    loadFlag(fromCurrency); // calling loadFlag with passing select element (fromCurrency) of FROM
    loadFlag(toCurrency); // calling loadFlag with passing select element (toCurrency) of TO
    getExchangeRate(); // calling getExchangeRate
})

function getExchangeRate(){
    getToCoffeePrice();
    const amount = document.querySelector("form input");
    const exchangeRateTxt = document.querySelector("form .exchange-rate");
    let amountVal = amount.value;
    // if user don't enter any value or enter 0 then we'll put 1 value by default in the input field
    if(amountVal == "" || amountVal == "0"){
        amount.value = "1";
        amountVal = 1;
    }
    exchangeRateTxt.innerText = "Getting exchange rate...";
    let url = `https://v6.exchangerate-api.com/v6/2fe28c56c95ea275d825268e/latest/${fromCurrency.value}`;
    const rateArray = [0," "," "];

    // fetching api response and returning it with parsing into js obj and in another then method receiving that obj
    fetch(url).then(response => response.json()).then(result =>{
        let exchangeRate = result.conversion_rates[toCurrency.value];
        rateArray[2]=toCurrency;
        rateArray[1]=fromCurrency;
        // getting user selected TO currency rate
        let totalExRate = (amountVal * exchangeRate).toFixed(2); // multiplying user entered value with selected TO currency rate
        exchangeRateTxt.innerText = `${amountVal} ${fromCurrency.value} = ${totalExRate} ${toCurrency.value}`;
     

      rateArray[0]=exchangeRate*parseInt(amountVal);
      
    
    }).catch(() =>{ // if user is offline or any other error occured while fetching data then catch function will run
        exchangeRateTxt.innerText = "Something went wrong";
    })
    .finally(() => {
        drawChart(amountVal,rateArray[0],rateArray[1],rateArray[2])
    });
}

function getFromCoffeePrice(){
    const amount = document.querySelector("form input");
    const exchangeRateTxt = document.querySelector("form .exchange-rate");
    let amountVal = amount.value;
    // no input or 0 defaults to 1
    if(amountVal == "" || amountVal == "0"){
        amount.value = "1";
        amountVal = 1;
    }
    exchangeRateTxt.innerText = "Getting exchange rate...";
  
    let url = `https://v6.exchangerate-api.com/v6/2fe28c56c95ea275d825268e/latest/${"USD"}`;
    let exchangeRate = 0;
    // getting user selected TO currency rate
    fetch(url).then(response => response.json()).then(result =>{
         let exchangeRate = result.conversion_rates[fromCurrency.value];
        // getting user selected TO currency rate
        let totalExRate = (amountVal * exchangeRate).toFixed(2); // multiplying user entered value with selected TO currency rate
        exchangeRateTxt.innerText = `${amountVal} ${fromCurrency.value} = ${totalExRate} ${toCurrency.value}`;
        document.getElementById("CoffeePrice").innerText = "A cup of coffee would cost " + (exchangeRate * 5).toFixed(2) + " " + fromCurrency.value;
    }).catch(() =>{ // stops errors from breaking everything
        exchangeRateTxt.innerText = "Something went wrong";
    })
    return(exchangeRate * 5);
}

function getToCoffeePrice(){
    const amount = document.querySelector("form input");
    const exchangeRateTxt = document.querySelector("form .exchange-rate");
    let amountVal = amount.value;
    // no input or 0 defaults to 1
    if(amountVal == "" || amountVal == "0"){
        amount.value = "1";
        amountVal = 1;
    }
    exchangeRateTxt.innerText = "Getting exchange rate...";
  
    let url = `https://v6.exchangerate-api.com/v6/2fe28c56c95ea275d825268e/latest/${"USD"}`;

    // getting api response and returning it with parsing into object
    fetch(url).then(response => response.json()).then(result =>{
        console.log(result)
        let exchangeRate = result.conversion_rates[toCurrency.value];
        // getting user selected TO currency rate
        let totalExRate = (amountVal * exchangeRate).toFixed(2); // converting TO currency rate
        exchangeRateTxt.innerText = `${amountVal} ${fromCurrency.value} = ${totalExRate} ${toCurrency.value}`;
        document.getElementById("CoffeePrice").innerText = "A cup of coffee would cost " + (exchangeRate * 5).toFixed(2) + " " + toCurrency.value + " or " + (result.conversion_rates[fromCurrency.value] * 5) + " " + fromCurrency.value + ".";
    }).catch(() =>{ // stops errors from breaking everything
        exchangeRateTxt.innerText = "Something went wrong";
    });
}

  google.charts.load("current", {packages:['corechart']});
  google.charts.setOnLoadCallback(drawChart);
  function drawChart(amountVal,rate,fromname,toname) {
    
    var data = google.visualization.arrayToDataTable([
      ["Country", "Rate", { role: "style" } ],
      [fromname.value,parseInt(amountVal) , "red"],
      [toname.value, rate, "orange"],
     
    ]);

    var view = new google.visualization.DataView(data);
    view.setColumns([0, 1,
                     { calc: "stringify",
                       sourceColumn: 1,
                       type: "string",
                       role: "annotation" },
                     2]);

    var options = {
      title: "",
      width: 560,
      height: 400,
      bar: {groupWidth: "95%"},
      legend: { position: "none" },
    };
    var chart = new google.visualization.ColumnChart(document.getElementById("columnchart_values"));
    chart.draw(view, options);
}