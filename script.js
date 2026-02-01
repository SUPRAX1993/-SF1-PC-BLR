let fullData = {};

// 1. جلب البيانات عند فتح الموقع
fetch('parts.json')
    .then(res => res.json())
    .then(data => {
        fullData = data;
        console.log("✅ تم تحميل البيانات:", data);

        // تعبئة القوائم
        populateSelect('cpu-select', data.cpus);
        populateSelect('gpu-select', data.gpus);
        populateSelect('mobo-select', data.motherboards);
        populateSelect('ram-select', data.ram);
        populateSelect('storage-select', data.storage);
        populateSelect('cooler-select', data.coolers);
        populateSelect('case-select', data.cases);
        populateSelect('psu-select', data.psu);

        // تشغيل المراقبين
        setupListeners();
    })
    .catch(err => console.error("❌ خطأ في تحميل الملف:", err));

// 2. دالة تعبئة القوائم (تضيف المعلومات داخل الزر المخفي)
function populateSelect(elementId, items) {
    const select = document.getElementById(elementId);
    if (!select) return;

    // الخيار الافتراضي
    select.innerHTML = '<option value="0" data-name="none">-- اختر قطعة --</option>';

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.price; // قيمة الخيار هي السعر
        option.text = `${item.name} (${item.price}$)`;
        
        // تخزين البيانات التقنية داخل العنصر نفسه لسهولة الوصول
        option.dataset.name = item.name;
        option.dataset.image = item.image || "https://placehold.co/400x400/eee/999?text=No+Image";
        option.dataset.socket = item.socket || ""; // تخزين السوكيت
        option.dataset.tier = item.tier || "";     // تخزين القوة
        
        select.appendChild(option);
    });
}

// 3. مراقبة التغييرات
function setupListeners() {
    const ids = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
    
    ids.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', function() {
                updatePreview(this);    // تحديث الصورة
                calculateAndCheck();    // تحديث السعر والفحص
            });
        }
    });
}

// 4. تحديث صورة المعاينة
function updatePreview(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const imgUrl = selectedOption.dataset.image;
    const name = selectedOption.dataset.name;

    const imgBox = document.getElementById('part-image');
    const nameBox = document.getElementById('part-name-display');

    if (imgBox && nameBox && name !== "none") {
        imgBox.src = imgUrl;
        nameBox.innerText = name;
    }
}

// 5. المحرك الرئيسي: حساب السعر + فحص التوافق
function calculateAndCheck() {
    // --- أولاً: حساب السعر الإجمالي ---
    const ids = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
    let total = 0;
    
    ids.forEach(id => {
        const val = parseInt(document.getElementById(id).value) || 0;
        total += val;
    });
    document.getElementById('total-price').innerText = total;

    // --- ثانياً: جلب بيانات القطع المختارة للفحص ---
    const cpuSelect = document.getElementById('cpu-select');
    const moboSelect = document.getElementById('mobo-select');
    const gpuSelect = document.getElementById('gpu-select');

    const cpuData = cpuSelect.options[cpuSelect.selectedIndex].dataset;
    const moboData = moboSelect.options[moboSelect.selectedIndex].dataset;
    const gpuData = gpuSelect.options[gpuSelect.selectedIndex].dataset;

    // --- ثالثاً: فحص توافق المعالج مع اللوحة ---
    const compBox = document.getElementById('compatibility-check');
    
    // هل اختار المستخدم الاثنين؟
    if (cpuData.name !== "none" && moboData.name !== "none") {
        if (cpuData.socket === moboData.socket) {
            compBox.innerText = `✅ متوافق: المعالج واللوحة كلاهما (${cpuData.socket})`;
            compBox.style.background = "#d4edda"; // أخضر فاتح
            compBox.style.color = "#155724";
        } else {
            compBox.innerText = `❌ غير متوافق! المعالج (${cpuData.socket}) لا يركب على (${moboData.socket})`;
            compBox.style.background = "#f8d7da"; // أحمر فاتح
            compBox.style.color = "#721c24";
        }
    } else {
        compBox.innerText = "الرجاء اختيار المعالج واللوحة للفحص...";
        compBox.style.background = "#eee";
        compBox.style.color = "#333";
    }

    // --- رابعاً: فحص عنق الزجاجة ---
    const bottleBox = document.getElementById('bottleneck-check');

    if (cpuData.name !== "none" && gpuData.name !== "none") {
        const cpuTier = parseInt(cpuData.tier) || 0;
        const gpuTier = parseInt(gpuData.tier) || 0;
        const diff = Math.abs(cpuTier - gpuTier);

        if (diff <= 2) {
            bottleBox.innerText = "✅ أداء متوازن وممتاز";
            bottleBox.style.background = "#d4edda";
            bottleBox.style.color = "#155724";
        } else if (cpuTier < gpuTier) {
            bottleBox.innerText = "⚠️ تحذير: المعالج قد يضعف أداء الكارت (Bottleneck)";
            bottleBox.style.background = "#fff3cd"; // أصفر
            bottleBox.style.color = "#856404";
        } else {
            bottleBox.innerText = "⚠️ الكارت ضعيف جداً مقارنة بالمعالج";
            bottleBox.style.background = "#fff3cd";
            bottleBox.style.color = "#856404";
        }
    } else {
        bottleBox.innerText = "الرجاء اختيار المعالج وكارت الشاشة...";
        bottleBox.style.background = "#eee";
        bottleBox.style.color = "#333";
    }
}

// --- ميزة الوضع الليلي ---
const toggleBtn = document.getElementById('dark-mode-toggle');
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    toggleBtn.innerText = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark); // حفظ الإعداد
});

// عند تحميل الصفحة: استرجاع الوضع الليلي
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    toggleBtn.innerText = '☀️';
}

// --- ميزة حفظ التجميعة (Auto-Save) ---
function saveConfiguration() {
    const selections = {};
    const ids = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
    ids.forEach(id => {
        selections[id] = document.getElementById(id).value;
    });
    localStorage.setItem('savedPC', JSON.stringify(selections));
}

// تعديل بسيط على Listener القديم ليدعم الحفظ
function setupListeners() {
    const ids = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
    ids.forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            updatePreview(this);
            calculateAndCheck();
            saveConfiguration(); // حفظ كلما تغير شيء
        });
    });
}

// عند تحميل البيانات: استرجاع التجميعة المحفوظة
// (أضف هذا الجزء داخل الـ .then الخاص بـ fetch بعد ملء القوائم)
function loadSavedPC() {
    const saved = JSON.parse(localStorage.getItem('savedPC'));
    if (saved) {
        Object.keys(saved).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = saved[id];
                // تحديث الصورة للقطع المحفوظة (اختياري للمعالج فقط كمثال)
                if(id === 'cpu-select') updatePreview(el);
            }
        });
        calculateAndCheck();
    }
}

