// تحميل التجميعات الجاهزة
fetch('builds.json')
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('builds-container');
        data.forEach(build => {
            container.innerHTML += `
                <div class="card">
                    <h3>${build.title}</h3>
                    <p>السعر: <strong>${build.price}</strong></p>
                    <a href="${build.link}" target="_blank" class="buy-btn">عرض التفاصيل</a>
                </div>`;
        });
    });

// تحميل القطع لصفحة "جمع جهازك"
fetch('parts.json')
    .then(res => res.json())
    .then(data => {
        const cpuSelect = document.getElementById('cpu-select');
        const gpuSelect = document.getElementById('gpu-select');

        data.cpus.forEach(item => cpuSelect.innerHTML += `<option value="${item.price}">${item.name} - ${item.price}$</option>`);
        data.gpus.forEach(item => gpuSelect.innerHTML += `<option value="${item.price}">${item.name} - ${item.price}$</option>`);
        updateBuilder();
    });

function updateBuilder() {
    const cpuPrice = parseInt(document.getElementById('cpu-select').value) || 0;
    const gpuPrice = parseInt(document.getElementById('gpu-select').value) || 0;
    document.getElementById('total-price').innerText = cpuPrice + gpuPrice;
}

