let fullData = {};
let selectedBuild = {
    cpus: null, gpus: null, motherboards: null, ram: null,
    storage: null, coolers: null, cases: null, psu: null
};
let currentCat = '';

const labels = {
    cpus: "المعالج", gpus: "كارت الشاشة", motherboards: "اللوحة الأم",
    ram: "الرامات", storage: "وحدة التخزين", coolers: "المبرد",
    cases: "الصندوق", psu: "مزود الطاقة"
};

// تشغيل عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    fetch('parts.json')
        .then(res => res.json())
        .then(data => {
            fullData = data;
            initBuilder();
        });

    document.getElementById('theme-toggle').onclick = toggleTheme;
    document.getElementById('part-search').oninput = (e) => renderList(e.target.value);
    document.getElementById('share-btn').onclick = shareBuild;
});

function initBuilder() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    Object.keys(labels).forEach(key => {
        const card = document.createElement('div');
        card.className = 'part-card';
        card.id = `card-${key}`;
        card.onclick = () => openModal(key);
        card.innerHTML = `
            <div>
                <h4>${labels[key]}</h4>
                <p id="name-${key}">لم يتم الاختيار</p>
            </div>
            <span style="color:var(--accent-color)">+</span>
        `;
        container.appendChild(card);
    });
}

function openModal(cat) {
    currentCat = cat;
    document.getElementById('modal-title').innerText = `اختيار ${labels[cat]}`;
    document.getElementById('selection-modal').style.display = 'block';
    document.getElementById('part-search').value = '';
    renderList();
}

function closeModal() {
    document.getElementById('selection-modal').style.display = 'none';
}

function renderList(search = '') {
    const list = document.getElementById('parts-list');
    list.innerHTML = '';
    const items = fullData[currentCat] || [];

    items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).forEach(item => {
        const div = document.createElement('div');
        div.className = 'part-item';

        const info = `
            <b>الاسم:</b> ${item.name}<br>
            <b>السوكيت:</b> ${item.socket || "N/A"}<br>
            <b>الطاقة:</b> ${item.wattage || 0}W<br>
            <b>الأداء:</b> ${item.tier}/10
        `;

        div.innerHTML = `
            <div style="flex:1">
                <strong>${item.name}</strong> <br>
                <small style="color:var(--accent-color)">$${item.price} | ${item.wattage || 0}W</small>
            </div>
            <button class="info-btn" onclick="event.stopPropagation(); showDetails('${item.name}', \`${info}\`)">i</button>
            <button class="btn btn-main" style="width:auto; padding:5px 15px; margin:0 10px" onclick="selectItem('${item.name}')">اختيار</button>
        `;
        list.appendChild(div);
    });
}

function selectItem(name) {
    const item = fullData[currentCat].find(i => i.name === name);
    selectedBuild[currentCat] = item;

    document.getElementById(`name-${currentCat}`).innerText = item.name;
    // تحديث الصورة إذا كانت موجودة، وإلا نضع صورة افتراضية
    document.getElementById('preview-img').src = item.image || 'https://via.placeholder.com/150';

    closeModal();
    updateMetrics();
}

function updateMetrics() {
    let totalPrice = 0;
    let totalWattage = 0;

    // حساب السعر والطاقة
    Object.keys(selectedBuild).forEach(key => {
        const item = selectedBuild[key];
        if (item) {
            totalPrice += item.price;
            // لا نحسب وات الباور سبلاي ضمن الاستهلاك
            if (key !== 'psu') {
                totalWattage += (item.wattage || 0);
            }
        }
    });

    // تحديث الواجهة للسعر والوات الإجمالي
    document.getElementById('total-price').innerText = totalPrice;
    
    // تأكد من وجود عنصر في الـ HTML لعرض الوات، وإلا سيتم تجاهله
    const wattDisplay = document.getElementById('total-wattage');
    if (wattDisplay) wattDisplay.innerText = totalWattage;

    // 1. فحص توافق السوكيت (CPU + Motherboard)
    const cpu = selectedBuild.cpus;
    const mobo = selectedBuild.motherboards;
    const psu = selectedBuild.psu;
    const ram = selectedBuild.ram;

    let compMsg = "✅ بانتظار استكمال القطع";
    let compColor = "var(--accent-color)";

    if (cpu && mobo) {
        if (cpu.socket === mobo.socket) {
            compMsg = `✅ متوافق (${cpu.socket})`;
        } else {
            compMsg = `❌ خطأ: السوكيت غير متطابق! (${cpu.socket} vs ${mobo.socket})`;
            compColor = "red";
        }
    }

    // 2. فحص كفاية الباور سبلاي
    if (psu) {
        if (psu.wattage < totalWattage) {
            compMsg = `⚠️ الباور سبلاي ضعيف! يحتاج ${totalWattage}W على الأقل`;
            compColor = "orange";
        }
    }

    // 3. فحص الرامات (DDR4 vs DDR5)
    if (ram && mobo) {
        const ramType = ram.name.includes("DDR5") ? "DDR5" : "DDR4";
        const moboType = mobo.name.includes("DDR5") ? "DDR5" : "DDR4";
        if (ramType !== moboType) {
            compMsg = `❌ اللوحة تدعم ${moboType} والرامات ${ramType}!`;
            compColor = "red";
        }
    }

    document.getElementById('comp-status').innerText = compMsg;
    document.getElementById('comp-status').style.color = compColor;

    // 4. فحص عنق الزجاجة (CPU + GPU)
    const gpu = selectedBuild.gpus;
    if (cpu && gpu) {
        const diff = Math.abs(cpu.tier - gpu.tier);
        if (diff <= 1) {
            document.getElementById('bottleneck-status').innerText = "✅ توازن خارق";
            document.getElementById('bottleneck-status').style.color = "#00ff00";
        } else if (diff === 2) {
            document.getElementById('bottleneck-status').innerText = "✅ توازن جيد";
            document.getElementById('bottleneck-status').style.color = "var(--accent-color)";
        } else {
            document.getElementById('bottleneck-status').innerText = "⚠️ احتمال عنق زجاجة ملحوظ";
            document.getElementById('bottleneck-status').style.color = "orange";
        }
    }
}

// الدوال الباقية (Share, Theme, Details) تبقى كما هي...
function shareBuild() {
    let text = "🖥️ تجميعة جهازي من SF1-PC:\n";
    Object.keys(selectedBuild).forEach(key => {
        if(selectedBuild[key]) text += `- ${labels[key]}: ${selectedBuild[key].name}\n`;
    });
    text += `\n💰 الإجمالي: $${document.getElementById('total-price').innerText}`;
    text += `\n⚡ استهلاك الطاقة: ${document.getElementById('total-wattage')?.innerText || '0'}W`;
    navigator.clipboard.writeText(text).then(() => alert("تم نسخ التقرير!"));
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    document.getElementById('theme-toggle').innerText = target === 'dark' ? '🌙' : '☀️';
}

function showDetails(title, content) {
    document.getElementById('details-title').innerText = title;
    document.getElementById('details-body').innerHTML = content;
    document.getElementById('details-modal').style.display = 'block';
}

function closeDetails() {
    document.getElementById('details-modal').style.display = 'none';
}

