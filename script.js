let fullData = {}; // مخزن للبيانات التقنية

// 1. تحميل البيانات من الملف
fetch('parts.json')
    .then(res => res.json())
    .then(data => {
        fullData = data;
        
        // ملء جميع القوائم
        populateSelect('cpu-select', data.cpus);
        populateSelect('gpu-select', data.gpus);
        populateSelect('mobo-select', data.motherboards);
        populateSelect('ram-select', data.ram);
        populateSelect('storage-select', data.storage);
        populateSelect('cooler-select', data.coolers);
        populateSelect('case-select', data.cases);
        populateSelect('psu-select', data.psu);

        setupListeners();
    });

function populateSelect(id, items) {
    const select = document.getElementById(id);
    if(!select) return;
    select.innerHTML = '<option value="0" data-name="none">-- اختر قطعة --</option>';
    
    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.price;
        opt.text = `${item.name} (${item.price}$)`;
        opt.dataset.name = item.name;
        opt.dataset.image = item.image;
        select.appendChild(opt);
    });
}

// 2. إعداد مراقب التغييرات
function setupListeners() {
    const ids = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
    ids.forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            updatePreview(this);
            calculateAndCheck(); // هذه الدالة تحسب السعر وتفحص التوافق معاً
        });
    });
}

function updatePreview(select) {
    const opt = select.options[select.selectedIndex];
    if (opt.dataset.image) {
        document.getElementById('part-image').src = opt.dataset.image;
        document.getElementById('part-name-display').innerText = opt.dataset.name;
    }
}

// 3. المحرك: حساب السعر + فحص التوافق + عنق الزجاجة
function calculateAndCheck() {
    const ids = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
    let total = 0;
    ids.forEach(id => {
        total += parseInt(document.getElementById(id).value) || 0;
    });
    document.getElementById('total-price').innerText = total;

    // جلب بيانات القطع المختارة للفحص
    const cpu = getSelectedInfo('cpu-select', 'cpus');
    const gpu = getSelectedInfo('gpu-select', 'gpus');
    const mobo = getSelectedInfo('mobo-select', 'motherboards');

    // فحص التوافق (Compatibility)
    let compBox = document.getElementById('compatibility-check');
    if (cpu && mobo) {
        if (cpu.socket === mobo.socket) {
            compBox.innerText = `✅ توافق سليم: المعالج واللوحة يدعمان ${cpu.socket}`;
            compBox.style.background = "#d4edda";
        } else {
            compBox.innerText = `❌ خطأ في التوافق: المعالج ${cpu.socket} واللوحة ${mobo.socket}`;
            compBox.style.background = "#f8d7da";
        }
    }

    // فحص عنق الزجاجة (Bottleneck)
    let bottleBox = document.getElementById('bottleneck-check');
    if (cpu && gpu) {
        const diff = Math.abs(cpu.tier - gpu.tier);
        if (diff <= 2) {
            bottleBox.innerText = "✅ توازن ممتاز بين القوة والأداء";
            bottleBox.style.background = "#d4edda";
        } else {
            bottleBox.innerText = "⚠️ تحذير: يوجد فرق كبير في الأداء (عنق زجاجة)";
            bottleBox.style.background = "#fff3cd";
        }
    }
}

// دالة مساعدة لجلب معلومات القطعة كاملة من المخزن
function getSelectedInfo(id, category) {
    const name = document.getElementById(id).options[document.getElementById(id).selectedIndex].dataset.name;
    return fullData[category]?.find(i => i.name === name);
}

