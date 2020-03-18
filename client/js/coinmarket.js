coinmarket = {
    steemdollars: function() {
        var xtr = new XMLHttpRequest();
        xtr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/steem-dollars/', true);
        xtr.send();
        xtr.onreadystatechange = function () {
            if (xtr.readyState == 4) {
                if (xtr.status == 200) {
                    if (xtr.responseText) {
                        try {
                            var ticker = JSON.parse(xtr.responseText)[0]
                        } catch (error) {
                            console.log(error)
                        }                       
                        Coins.insert(ticker)
                        Session.set('sbdprice',ticker.price_usd)
                    }
                } else {
                    console.log("Error: CoinMarket not responding!");
                }
            }
        }
    },
    steem: function() {
        var xtr = new XMLHttpRequest();
        xtr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/steem/', true);
        xtr.send();
        xtr.onreadystatechange = function () {
            if (xtr.readyState == 4) {
                if (xtr.status == 200) {
                    if (xtr.responseText) {
                        try {
                            var ticker = JSON.parse(xtr.responseText)[0]
                        } catch (error) {
                            console.log(error)
                        } 
                        Coins.insert(ticker)
                        Session.set('steemprice',ticker.price_usd)
                    }
                } else {
                    console.log("Error: CoinMarket not responding!");
                }
            }
        }
    },
}