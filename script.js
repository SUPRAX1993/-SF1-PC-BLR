let fullData = {};

// 1. تحميل البيانات والبدء
fetch('parts.json')
    .then(res => res.json())
    .then(data => {
        fullData = data;
        populateAllSelects(data);
        setupListeners();
        loadSavedConfiguration(); // استرجاع ما حفظه المستخدم سابقاً
    });

function populateAllSelects(data) {
    populateSelect('cpu-select', data.cpus);
    populateSelect('gpu-select', data.gpus);
    populateSelect('mobo-select', data.motherboards);
    populateSelect('ram-select', data.ram);
    populateSelect('storage-select', data.storage);
    populateSelect('cooler-select', data.coolers);
    populateSelect('case-select', data.cases);
    populateSelect('psu-select', data.psu);
}

function populateSelect(id, items) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '<option value="0" data-name="none">-- اختر قطعة --</option>';
    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.price;
        opt.text = `${item.name} (${item.price}$)`;
        opt.dataset.name = item.name;
        opt.dataset.image = item.image;
        opt.dataset.socket = item.socket || "";
        opt.dataset.tier = item.tier || 0;
        select.appendChild(opt);
    });
}

function setupListeners() {
    const ids = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
    ids.forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            updateUI();
            saveConfiguration();
        });
    });

    // زر الوضع الليلي
    const toggle = document.getElementById('dark-mode-toggle');
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        toggle.innerText = isDark ? '☀️' : '🌙';
        localStorage.setItem('darkMode', isDark);
    });
    if(localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        toggle.innerText = '☀️';
    }

    // زر المشاركة
    document.getElementById('share-btn').addEventListener('click', copyToClipboard);
}

function updateUI() {
    let total = 0;
    const ids = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
    
    ids.forEach(id => {
        const select = document.getElementById(id);
        total += parseInt(select.value) || 0;
        if (id === event?.target?.id) { // تحديث الصورة فقط للقطعة التي تغيرت الآن
            const opt = select.options[select.selectedIndex];
            if(opt.dataset.name !== "none") {
                document.getElementById('part-image').src = opt.dataset.image;
                document.getElementById('part-name-display').innerText = opt.dataset.name;
            }
        }
    });
    document.getElementById('total-price').innerText = total;
    checkCompatibility();
}

function checkCompatibility() {
    const cpu = document.getElementById('cpu-select').options[document.getElementById('cpu-select').selectedIndex].dataset;
    const mobo = document.getElementById('mobo-select').options[document.getElementById('mobo-select').selectedIndex].dataset;
    const gpu = document.getElementById('gpu-select').options[document.getElementById('gpu-select').selectedIndex].dataset;

    const compBox = document.getElementById('compatibility-check');
    const bottleBox = document.getElementById('bottleneck-check');

    // فحص اللوحة والمعالج
    if (cpu.name !== "none" && mobo.name !== "none") {
        if (cpu.socket === mobo.socket) {
            compBox.innerText = `✅ متوافق (${cpu.socket})`;
            compBox.style.background = "#d4edda";
        } else {
            compBox.innerText = `❌ خطأ: ${cpu.socket} لا يركب على ${mobo.socket}`;
            compBox.style.background = "#f8d7da";
        }
    }

    // فحص عنق الزجاجة
    if (cpu.name !== "none" && gpu.name !== "none") {
        const diff = Math.abs(parseInt(cpu.tier) - parseInt(gpu.tier));
        bottleBox.innerText = diff <= 2 ? "✅ توازن ممتاز" : "⚠️ تحذير: عنق زجاجة ملحوظ";
        bottleBox.style.background = diff <= 2 ? "#d4edda" : "#fff3cd";
    }
}

function copyToClipboard() {
    let text = "🖥️ تجميعة جهازي:\n";
    const ids = ['cpu-select', 'gpu-select', 'mobo-select'];
    ids.forEach(id => {
        const s = document.getElementById(id);
        if(s.value !== "0") text += `- ${s.options[s.selectedIndex].text}\n`;
    });
    text += `💰 المجموع: $${document.getElementById('total-price').innerText}`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert("تم نسخ التجميعة بنجاح!");
    });
}

function saveConfiguration() {
    const config = {};
    const ids = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
    ids.forEach(id => config[id] = document.getElementById(id).value);
    localStorage.setItem('savedPC', JSON.stringify(config));
}

function loadSavedConfiguration() {
    const saved = JSON.parse(localStorage.getItem('savedPC'));
    if (saved) {
        Object.keys(saved).forEach(id => {
            const el = document.getElementById(id);
            if(el) el.value = saved[id];
        });
        updateUI();
    }
}

