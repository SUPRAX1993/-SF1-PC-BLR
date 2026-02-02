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
        div.innerHTML = `
            <div style="flex:1">
                <strong>${item.name}</strong> <br>
                <small style="color:var(--accent-color)">$${item.price} | ${item.wattage}W</small>
            </div>
            <button class="info-btn" onclick="event.stopPropagation(); alert('تفاصيل: ${item.name}\\nالسوكيت: ${item.socket || "N/A"}\\nالأداء: ${item.tier}/10')">i</button>
            <button class="btn btn-main" style="width:auto; padding:5px 15px; margin:0 10px" onclick="selectItem('${item.name}')">اختيار</button>
        `;
        list.appendChild(div);
    });
}

function selectItem(name) {
    const item = fullData[currentCat].find(i => i.name === name);
    selectedBuild[currentCat] = item;
    
    // تحديث الواجهة
    document.getElementById(`name-${currentCat}`).innerText = item.name;
    document.getElementById('preview-img').src = item.image;
    
    closeModal();
    updateMetrics();
}

function updateMetrics() {
    let total = 0;
    let wattage = 0;
    
    Object.values(selectedBuild).forEach(item => {
        if(item) {
            total += item.price;
            wattage += (item.wattage || 0);
        }
    });

    document.getElementById('total-price').innerText = total;
    
    // فحص التوافق
    const cpu = selectedBuild.cpus;
    const mobo = selectedBuild.motherboards;
    const gpu = selectedBuild.gpus;

    if(cpu && mobo) {
        const comp = cpu.socket === mobo.socket;
        document.getElementById('comp-status').innerText = comp ? `✅ متوافق (${cpu.socket})` : `❌ خطأ في السوكيت!`;
        document.getElementById('comp-status').style.color = comp ? 'var(--accent-color)' : 'red';
    }

    if(cpu && gpu) {
        const diff = Math.abs(cpu.tier - gpu.tier);
        document.getElementById('bottleneck-status').innerText = diff <= 2 ? "✅ توازن ممتاز" : "⚠️ احتمال عنق زجاجة";
    }
}

function shareBuild() {
    let text = "🖥️ تجميعة جهازي من SF1-PC:\n";
    Object.keys(selectedBuild).forEach(key => {
        if(selectedBuild[key]) text += `- ${labels[key]}: ${selectedBuild[key].name}\n`;
    });
    text += `\n💰 الإجمالي: $${document.getElementById('total-price').innerText}`;
    navigator.clipboard.writeText(text).then(() => alert("تم نسخ التقرير!"));
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    document.getElementById('theme-toggle').innerText = target === 'dark' ? '🌙' : '☀️';
}

