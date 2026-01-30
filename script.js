// جلب وعرض قطع التجميع اليدوي
fetch('parts.json').then(res => res.json()).then(data => {
    populateSelect('cpu-select', data.cpus);
    populateSelect('gpu-select', data.gpus);
    populateSelect('mobo-select', data.motherboards);
    populateSelect('ram-select', data.ram);
    populateSelect('storage-select', data.storage);
    populateSelect('psu-select', data.psu);
    calculateTotal();
}).catch(err => console.error("خطأ في تحميل البيانات:", err));

function populateSelect(id, items) {
    const select = document.getElementById(id);
    if (!select || !items) return;
    select.innerHTML = items.map(item => `<option value="${item.price}">${item.name} (+${item.price}$)</option>`).join('');
}

function calculateTotal() {
    const ids = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'psu-select'];
    let total = 0;
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) total += parseInt(el.value) || 0;
    });
    document.getElementById('total-price').innerText = total;
}

