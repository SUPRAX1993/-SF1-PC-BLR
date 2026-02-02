// --- تعريفات عامة ---
let fullData = {};
const componentIds = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
const storageKey = 'SF1_Ultimate_Build_V2'; 

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetch('parts.json')
        .then(res => res.json())
        .then(data => {
            fullData = data;
            populateAllSelects();
            setupEventListeners();
            loadSavedBuild();
        })
        .catch(err => console.error("Error loading JSON:", err));
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-toggle').innerText = savedTheme === 'dark' ? '☀️' : '🌙';
}

function populateAllSelects() {
    const mapping = {
        'cpu-select': fullData.cpus,
        'gpu-select': fullData.gpus,
        'mobo-select': fullData.motherboards,
        'ram-select': fullData.ram,
        'storage-select': fullData.storage,
        'cooler-select': fullData.coolers,
        'case-select': fullData.cases,
        'psu-select': fullData.psu
    };

    Object.keys(mapping).forEach(id => {
        const select = document.getElementById(id);
        if (select && mapping[id]) {
            select.innerHTML = '<option value="0" data-name="none" data-price="0" data-wattage="0" data-tier="0">-- اختر المكون --</option>';
            mapping[id].forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.price; // السعر هو القيمة الأساسية
                opt.text = `${item.name} ($${item.price})`;
                opt.dataset.name = item.name;
                opt.dataset.price = item.price;
                opt.dataset.wattage = item.wattage || 0;
                opt.dataset.tier = item.tier || 0;
                opt.dataset.socket = item.socket || "";
                opt.dataset.image = item.image || "";
                select.appendChild(opt);
            });
        }
    });
}

function setupEventListeners() {
    componentIds.forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            updatePreviewImage(e.target);
            calculateAllMetrics(); // الحساب فور التغيير
            saveBuild();
        });
    });
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        document.getElementById('theme-toggle').innerText = next === 'dark' ? '☀️' : '🌙';
    });
    document.getElementById('share-btn').addEventListener('click', generateProfessionalReport);
    document.getElementById('reset-btn').addEventListener('click', resetBuilder);
}

function updatePreviewImage(selectElement) {
    const opt = selectElement.options[selectElement.selectedIndex];
    if (opt.dataset.name !== "none" && opt.dataset.image) {
        document.getElementById('preview-img').src = opt.dataset.image;
        document.getElementById('preview-label').innerText = `معاينة: ${opt.dataset.name}`;
    }
}

function calculateAllMetrics() {
    let totalPrice = 0;
    let totalWattage = 0;
    let cpuTier = 0;
    let gpuTier = 0;
    const summaryList = document.getElementById('build-summary');
    summaryList.innerHTML = '';

    componentIds.forEach(id => {
        const select = document.getElementById(id);
        const opt = select.options[select.selectedIndex];
        
        const price = parseInt(opt.dataset.price) || 0;
        const watt = parseInt(opt.dataset.wattage) || 0;
        const tier = parseInt(opt.dataset.tier) || 0;

        if (opt.dataset.name !== "none") {
            totalPrice += price;
            totalWattage += watt;
            
            if (id === 'cpu-select') cpuTier = tier;
            if (id === 'gpu-select') gpuTier = tier;

            const li = document.createElement('li');
            li.innerHTML = `<span>${opt.dataset.name}</span><span>$${price}</span>`;
            summaryList.appendChild(li);
        }
    });

    if (totalPrice === 0) summaryList.innerHTML = '<li>لم يتم اختيار قطع بعد</li>';

    // تحديث الأرقام في الواجهة
    document.getElementById('total-price-display').innerText = totalPrice;
    document.getElementById('wattage-value').innerText = `${totalWattage} W`;
    
    // تحديث أشرطة التقدم
    const wattPercent = Math.min((totalWattage / 1000) * 100, 100);
    document.getElementById('wattage-bar').style.width = `${wattPercent}%`;

    let score = 0;
    if (cpuTier > 0 && gpuTier > 0) {
        score = Math.round(((cpuTier * 0.4) + (gpuTier * 0.6)) * 10);
    }
    document.getElementById('score-value').innerText = `${score} / 100`;
    document.getElementById('score-bar').style.width = `${score}%`;

    // فحص التوافق وعنق الزجاجة
    checkStatus();
}

function checkStatus() {
    const cpu = document.getElementById('cpu-select').options[document.getElementById('cpu-select').selectedIndex].dataset;
    const mobo = document.getElementById('mobo-select').options[document.getElementById('mobo-select').selectedIndex].dataset;
    const gpu = document.getElementById('gpu-select').options[document.getElementById('gpu-select').selectedIndex].dataset;

    const compText = document.getElementById('comp-text');
    const bottleText = document.getElementById('bottle-text');

    if (cpu.name !== "none" && mobo.name !== "none") {
        if (cpu.socket === mobo.socket) {
            compText.innerText = `✅ متوافق (Socket ${cpu.socket})`;
        } else {
            compText.innerText = `❌ خطأ في التوافق: ${cpu.socket} vs ${mobo.socket}`;
        }
    }

    if (cpu.name !== "none" && gpu.name !== "none") {
        const diff = Math.abs(cpu.tier - gpu.tier);
        bottleText.innerText = diff <= 2 ? "✅ توازن أداء ممتاز" : "⚠️ يوجد احتمالية عنق زجاجة";
    }
}

function saveBuild() {
    const build = {};
    componentIds.forEach(id => build[id] = document.getElementById(id).value);
    localStorage.setItem(storageKey, JSON.stringify(build));
}

function loadSavedBuild() {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved) {
        componentIds.forEach(id => {
            if (document.getElementById(id)) document.getElementById(id).value = saved[id];
        });
        calculateAllMetrics();
    }
}

function resetBuilder() {
    localStorage.removeItem(storageKey);
    location.reload();
}

function generateProfessionalReport() {
    let report = "🖥️ تقرير تجميعة SF1-PC ULTIMATE\n\n";
    report += `💰 الإجمالي: $${document.getElementById('total-price-display').innerText}\n`;
    report += `⚡ الطاقة: ${document.getElementById('wattage-value').innerText}\n`;
    report += `🚀 الأداء: ${document.getElementById('score-value').innerText}\n`;
    navigator.clipboard.writeText(report).then(() => alert("تم نسخ التقرير!"));
}

