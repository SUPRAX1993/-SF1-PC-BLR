let adsData = {};

document.addEventListener('DOMContentLoaded', () => {
    fetch('parts.json')
        .then(res => res.json())
        .then(data => {
            adsData = data;
            showAds('buy'); // العرض الافتراضي
        });
});

function showAds(type) {
    const container = document.getElementById('ads-container');
    const list = type === 'buy' ? adsData.buy_ads : adsData.sell_ads;
    
    // تحديث شكل الأزرار
    document.getElementById('buy-tab').className = type === 'buy' ? 'active' : '';
    document.getElementById('sell-tab').className = type === 'sell' ? 'active' : '';

    container.innerHTML = list.map(ad => `
        <div class="ad-card">
            <div class="merchant-info">
                <strong>${ad.merchant}</strong>
                <span>تكتمل بنسبة ${ad.completion}</span>
            </div>
            <div class="price-info">
                <span class="label">السعر</span>
                <h2 class="price">${ad.price} ${ad.currency}</h2>
            </div>
            <div class="limit-info">
                <p>الحدود: ${ad.limit} ${ad.currency}</p>
                <p>طريقة الدفع: <span class="method">${ad.method}</span></p>
            </div>
            <button class="btn-trade" onclick="openTrade('${ad.merchant}', ${ad.price})">
                ${type === 'buy' ? 'شراء USDT' : 'بيع USDT'}
            </button>
        </div>
    `).join('');
}

function openTrade(name, price) {
    const modal = document.getElementById('trade-modal');
    document.getElementById('modal-body').innerHTML = `
        <p>أنت تتعامل مع: <strong>${name}</strong></p>
        <p>السعر المثبت: <strong>${price} USD</strong></p>
        <input type="number" placeholder="أدخل المبلغ الذي تود دفعه..." id="amount-input">
        <p>ستستلم تقريباً: <span id="receive-amount">0</span> USDT</p>
    `;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('trade-modal').style.display = 'none';
}

