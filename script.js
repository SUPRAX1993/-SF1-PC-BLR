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
    // استعادة الثيم المحفوظ
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // جلب البيانات مع معالجة الخطأ
    fetch('parts.json')
        .then(res => {
            if (!res.ok) throw new Error('لم يتم العثور على ملف parts.json');
            return res.json();
        })
        .then(data => {
            fullData = data;
            initBuilder();
            console.log("البيانات جاهزة");
        })
        .catch(err => {
            console.error("خطأ في التحميل:", err);
            document.getElementById('cards-container').innerHTML = 
                `<p style="color:red; text-align:center; width:100%">خطأ: تعذر تحميل البيانات. تأكد من وجود ملف parts.json</p>`;
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
            <span style="color:var(--accent-color); font-size:24px">+</span>
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

    const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding:20px;">لا توجد نتائج...</p>';
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = 'part-item';
        div.innerHTML = `
            <div style="flex:1">
                <strong>${item.name}</strong> <br>
                <small style="color:var(--accent-color)">$${item.price} | ${item.wattage || 0}W</small>
            </div>
            <button class="btn-main" style="padding:5px 15px;" onclick="selectItem('${item.name.replace(/'/g, "\\'")}')">اختيار</button>
        `;
        list.appendChild(div);
    });
}

function selectItem(name) {
    const item = fullData[currentCat].find(i => i.name === name);
    selectedBuild[currentCat] = item;

    document.getElementById(`name-${currentCat}`).innerText = item.name;
    closeModal();
    updateMetrics();
}

function updateMetrics() {
    let totalPrice = 0;
    let totalWattage = 0;

    Object.keys(selectedBuild).forEach(key => {
        const item = selectedBuild[key];
        if (item) {
            totalPrice += item.price;
            if (key !== 'psu') totalWattage += (item.wattage || 0);
        }
    });

    document.getElementById('total-price').innerText = totalPrice;
    document.getElementById('total-wattage').innerText = totalWattage;

    // فحص التوافق البسيط
    const cpu = selectedBuild.cpus;
    const mobo = selectedBuild.motherboards;
    if (cpu && mobo) {
        const isComp = cpu.socket === mobo.socket;
        const status = document.getElementById('comp-status');
        status.innerText = isComp ? `✅ متوافق (${cpu.socket})` : `❌ سوكيت غير متوافق!`;
        status.style.color = isComp ? 'var(--success)' : 'var(--danger)';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target); // حفظ في الذاكرة
    updateThemeIcon(target);
}

function updateThemeIcon(theme) {
    document.getElementById('theme-toggle').innerText = theme === 'dark' ? '🌙' : '☀️';
}

function shareBuild() {
    let text = "🖥️ تجميعة جهازي من SF1-PC:\n";
    Object.keys(selectedBuild).forEach(key => {
        if(selectedBuild[key]) text += `- ${labels[key]}: ${selectedBuild[key].name}\n`;
    });
    text += `\n💰 الإجمالي: $${document.getElementById('total-price').innerText}`;
    navigator.clipboard.writeText(text).then(() => alert("تم نسخ التقرير!"));
}

