document.addEventListener('DOMContentLoaded', () => {
    fetch('parts.json')
        .then(res => res.json())
        .then(data => {
            // تحديث الرصيد الإجمالي من ملف الـ JSON
            document.getElementById('balance-val').innerText = data.total_balance.toLocaleString();

            // روابط الأيقونات الرسمية
            const iconUrls = {
                "USDT": "https://cryptologos.cc/logos/tether-usdt-logo.png",
                "BTC": "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
                "ETH": "https://cryptologos.cc/logos/ethereum-eth-logo.png"
            };

            // عرض العملات في القائمة
            const list = document.getElementById('assets-list');
            list.innerHTML = data.assets.map(coin => `
                <div class="asset-item">
                    <div class="asset-left">
                        <img src="${iconUrls[coin.symbol] || 'https://via.placeholder.com/32'}" class="coin-icon-img" alt="${coin.symbol}">
                        <div>
                            <span class="coin-name">${coin.symbol}</span>
                            <span class="coin-change" style="color: ${coin.change.startsWith('+') ? 'var(--green)' : 'var(--red)'}">
                                ${coin.change}
                            </span>
                        </div>
                    </div>
                    <div class="asset-right" dir="ltr">
                        <span class="asset-balance">${coin.balance}</span>
                        <span class="asset-usd">≈ ${coin.value_usd} USD</span>
                    </div>
                </div>
            `).join('');
        });
});

