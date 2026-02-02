// --- تعريفات عامة ---
let fullData = {};
const componentIds = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
const storageKey = 'SF1_Ultimate_Build_V1'; // مفتاح حفظ جديد للنسخة الجديدة

// --- 1. التهيئة وتشغيل التطبيق ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme(); // تشغيل الثيم المفضل فوراً

    fetch('parts.json')
        .then(res => res.json())
        .then(data => {
            fullData = data;
            console.log("✅ تم تحميل قاعدة البيانات بنجاح (Ultimate Engine Ready).");
            populateAllSelects();
            setupEventListeners();
            loadSavedBuild(); // استرجاع التجميعة المحفوظة
        })
        .catch(err => {
            console.error("❌ خطأ كارثي في تحميل البيانات:", err);
            alert("عذراً، فشل تحميل قاعدة بيانات القطع. يرجى تحديث الصفحة.");
        });
});

// --- 2. وظائف المظهر (Theme Engine) ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // الوضع الافتراضي داكن
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    btn.innerText = theme === 'dark' ? '☀️' : '🌙';
}

// --- 3. تعبئة البيانات والقوائم ---
function populateAllSelects() {
    componentIds.forEach(id => {
        // استخراج اسم الفئة من الـ ID (مثلاً cpu-select يصبح cpus)
        let category = id.replace('-select', '');
        if (category === 'ram') category = 'ram'; // معالجة حالات خاصة إن وجدت
        else if (category === 'storage' || category === 'psu') category = category;
        else category += 's'; // إضافة 's' للجمع (cpus, gpus...)

        if (fullData[category]) {
            populateSingleSelect(id, fullData[category]);
        }
    });
}

function populateSingleSelect(elementId, items) {
    const select = document.getElementById(elementId);
    select.innerHTML = '<option value="0" data-name="none">-- اختر المكون --</option>';
    
    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.price;
        opt.text = `${item.name} [${item.price}$]`;
        
        // تخزين كافة البيانات التقنية في الـ dataset (السر وراء الميزات الجديدة)
        opt.dataset.name = item.name;
        opt.dataset.image = item.image || "";
        opt.dataset.socket = item.socket || "unknown";
        // هنا المفاجأة: استخدام بيانات الواط والتقييم إذا وجدت في ملف JSON
        opt.dataset.tier = item.tier || 1; // افتراضي 1 إذا لم يوجد
        opt.dataset.wattage = item.wattage || 0; // افتراضي 0 إذا لم يوجد
        
        select.appendChild(opt);
    });
}

// --- 4. إعداد المستمعات (Event Listeners) ---
function setupEventListeners() {
    // مراقبة القوائم
    componentIds.forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            handleSelectionChange(e.target);
        });
    });

    // أزرار التحكم
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('share-btn').addEventListener('click', generateProfessionalReport);
    document.getElementById('reset-btn').addEventListener('click', resetBuilder);
}

// --- 5. معالج التغييرات الرئيسي (The Core Logic) ---
function handleSelectionChange(changedSelectElement) {
    updatePreviewImage(changedSelectElement);
    calculateAllMetrics(); // حساب كل شيء: السعر، الطاقة، التوافق، الأداء
    saveBuild();
}

function updatePreviewImage(selectElement) {
    const opt = selectElement.options[selectElement.selectedIndex];
    const img = document.getElementById('preview-img');
    const label = document.getElementById('preview-label');

    if (opt.dataset.name !== "none" && opt.dataset.image) {
        // تأثير تلاشي بسيط عند تغيير الصورة
        img.style.opacity = 0;
        setTimeout(() => {
            img.src = opt.dataset.image;
            label.innerText = `معاينة: ${opt.dataset.name}`;
            img.style.opacity = 1;
        }, 150);
    }
}

// --- 6. محرك الحسابات الشامل (The Beast Engine) ---
function calculateAllMetrics() {
    let totalPrice = 0;
    let totalWattage = 100; // قيمة أساسية للوحة والمراوح وغيرها
    let cpuTier = 0, gpuTier = 0;
    let selectedPartsCount = 0;
    const summaryList = document.getElementById('build-summary');
    summaryList.innerHTML = ''; // مسح القائمة القديمة

    // جلب بيانات القطع المختارة
    const cpuData = getSelectedData('cpu-select');
    const moboData = getSelectedData('mobo-select');
    const gpuData = getSelectedData('gpu-select');

    // حلقة تكرارية على كل القوائم لحساب الإجماليات
    componentIds.forEach(id => {
        const select = document.getElementById(id);
        const price = parseInt(select.value) || 0;
        const data = select.options[select.selectedIndex].dataset;

        if (data.name !== "none") {
            totalPrice += price;
            totalWattage += parseInt(data.wattage) || 0;
            selectedPartsCount++;

            // إضافة للقائمة المختصرة
            const li = document.createElement('li');
            li.innerHTML = `<span class="summary-part-name">${data.name}</span><span class="summary-part-price">$${price}</span>`;
            summaryList.appendChild(li);

            // حفظ بيانات الـ Tier للمعالج والكارت للحساب لاحقاً
            if (id === 'cpu-select') cpuTier = parseInt(data.tier) || 0;
            if (id === 'gpu-select') gpuTier = parseInt(data.tier) || 0;
        }
    });

    if (selectedPartsCount === 0) {
        summaryList.innerHTML = '<li style="text-align: center; color: var(--text-secondary);">لم يتم اختيار قطع بعد</li>';
        totalWattage = 0; // تصحيح الواط إذا لم يختر شيء
    }

    // >>> تحديث الواجهة <<<

    // 1. السعر
    animateValue('total-price-display', parseInt(document.getElementById('total-price-display').innerText), totalPrice, 500);

    // 2. استهلاك الطاقة (الميزة الجديدة!)
    document.getElementById('wattage-value').innerText = `${totalWattage} W`;
    const wattagePercent = Math.min((totalWattage / 1200) * 100, 100); // افتراض أقصى باور 1200 واط
    const wattageBar = document.getElementById('wattage-bar');
    wattageBar.style.width = `${wattagePercent}%`;
    // تغيير لون الشريط بناء على الاستهلاك
    if (wattagePercent > 80) wattageBar.style.background = 'var(--danger)';
    else if (wattagePercent > 50) wattageBar.style.background = 'var(--warning)';
    else wattageBar.style.background = 'var(--success)';

    // 3. نتيجة الأداء (Gaming Score) (الميزة الجديدة!)
    let score = 0;
    if (cpuTier > 0 && gpuTier > 0) {
        // معادلة بسيطة لتقدير الأداء بناء على الـ Tiers (من 100)
        score = Math.round(((cpuTier * 4) + (gpuTier * 6)) * 10); 
        score = Math.min(score, 100); // لا يتجاوز 100
    }
    document.getElementById('score-value').innerText = `${score} / 100`;
    document.getElementById('score-bar').style.width = `${score}%`;

    // 4. فحص التوافق
    checkCompatibility(cpuData, moboData);

    // 5. فحص عنق الزجاجة
    checkBottleneck(cpuTier, gpuTier, cpuData, gpuData);
}


// --- دوال مساعدة للفحص ---
function getSelectedData(id) {
    const select = document.getElementById(id);
    return select.options[select.selectedIndex].dataset;
}

function checkCompatibility(cpu, mobo) {
    const alertBox = document.getElementById('compatibility-alert');
    const alertText = document.getElementById('comp-text');
    const alertIcon = alertBox.querySelector('.alert-icon');

    if (cpu.name !== "none" && mobo.name !== "none") {
        if (cpu.socket === mobo.socket && cpu.socket !== "unknown") {
            alertBox.style.background = 'rgba(46, 204, 113, 0.15)'; // لون نجاح شفاف
            alertBox.style.color = 'var(--success)';
            alertText.innerText = `توافق ممتاز: المعالج واللوحة يدعمان سوكيت ${cpu.socket}.`;
            alertIcon.innerText = '✅';
        } else if (cpu.socket !== "unknown" && mobo.socket !== "unknown") {
            alertBox.style.background = 'rgba(231, 76, 60, 0.15)'; // لون خطر شفاف
            alertBox.style.color = 'var(--danger)';
            alertText.innerText = `خطأ فادح! المعالج (${cpu.socket}) لا يعمل على اللوحة (${mobo.socket}).`;
            alertIcon.innerText = '❌';
        } else {
             // حالة عدم توفر بيانات السوكيت
            alertBox.style.background = 'var(--bg-main)';
            alertBox.style.color = 'var(--text-secondary)';
            alertText.innerText = `لا يمكن التحقق من التوافق لعدم توفر بيانات السوكيت.`;
             alertIcon.innerText = '⚠️';
        }
    } else {
        alertBox.style.background = 'var(--bg-main)';
        alertBox.style.color = 'var(--text-secondary)';
        alertText.innerText = 'ابدأ باختيار المعالج واللوحة الأم للفحص...';
        alertIcon.innerText = 'ℹ️';
    }
}

function checkBottleneck(cpuT, gpuT, cpuD, gpuD) {
    const alertBox = document.getElementById('bottleneck-alert');
    const alertText = document.getElementById('bottle-text');
    const alertIcon = alertBox.querySelector('.alert-icon');

    if (cpuD.name !== "none" && gpuD.name !== "none") {
        const diff = cpuT - gpuT;
        if (diff >= -2 && diff <= 2) {
            alertBox.style.background = 'rgba(46, 204, 113, 0.15)';
            alertBox.style.color = 'var(--success)';
            alertText.innerText = "توازن مثالي: لا يوجد عنق زجاجة ملحوظ بين المعالج والكارت.";
            alertIcon.innerText = '🚀';
        } else if (diff < -2) {
             // المعالج أضعف بكثير
            alertBox.style.background = 'rgba(241, 196, 15, 0.15)';
            alertBox.style.color = 'var(--warning)';
            alertText.innerText = "تحذير: المعالج قد يحد من أداء كارت الشاشة (Bottleneck).";
            alertIcon.innerText = '⚠️';
        } else {
             // الكارت أضعف بكثير
             alertBox.style.background = 'var(--bg-main)';
             alertBox.style.color = 'var(--text-secondary)';
             alertText.innerText = "ملاحظة: كارت الشاشة هو الحلقة الأضعف في هذه التجميعة.";
             alertIcon.innerText = 'ℹ️';
        }
    } else {
        alertBox.style.background = 'var(--bg-main)';
        alertBox.style.color = 'var(--text-secondary)';
        alertText.innerText = 'تحليل عنق الزجاجة غير نشط...';
        alertIcon.innerText = 'ℹ️';
    }
}

// --- 7. وظائف إضافية احترافية ---

// دالة لعمل تأثير عداد للأرقام (Animate Number)
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerText = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
             obj.innerText = end; // التأكد من الوصول للرقم النهائي
        }
    };
    window.requestAnimationFrame(step);
}

// تقرير احترافي للمشاركة
function generateProfessionalReport() {
    let report = "📜 تقرير تجميعة احترافي من منصة SF1-PC ULTIMATE\n\n";
    report += "--- المكونات المختارة ---\n";
    
    componentIds.forEach(id => {
        const select = document.getElementById(id);
        const name = select.options[select.selectedIndex].dataset.name;
        if (name !== "none") {
            const label = select.parentElement.querySelector('label').innerText.split('(')[0].trim();
            report += `🔹 ${label}: ${name}\n`;
        }
    });

    report += "\n--- ملخص الأداء والطاقة ---\n";
    report += `💰 الإجمالي: $${document.getElementById('total-price-display').innerText}\n`;
    report += `⚡ استهلاك الطاقة التقديري: ${document.getElementById('wattage-value').innerText}\n`;
    report += `🚀 تقييم الأداء: ${document.getElementById('score-value').innerText}\n`;
    report += `✅ حالة التوافق: ${document.getElementById('comp-text').innerText}\n`;
    report += "\n🔗 تم الإنشاء بواسطة: https://supra1993.github.io/SF1-PC-BLR/";

    navigator.clipboard.writeText(report).then(() => {
        const btn = document.getElementById('share-btn');
        const originalText = btn.innerText;
        btn.innerText = "✅ تم نسخ التقرير بنجاح!";
        btn.style.background = "var(--success)";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.removeAttribute('style'); // العودة للستايل الأساسي
        }, 2500);
    }).catch(() => alert("فشل النسخ. يرجى المحاولة يدوياً."));
}

// إعادة تعيين التجميعة
function resetBuilder() {
    if (confirm("هل أنت متأكد من رغبتك في تصفير التجميعة والبدء من جديد؟")) {
        componentIds.forEach(id => {
            document.getElementById(id).value = "0";
        });
        localStorage.removeItem(storageKey);
        calculateAllMetrics(); // تحديث الواجهة للصفر
        document.getElementById('preview-img').src = "https://placehold.co/600x400/141414/00f2c3?text=SF1+ULTIMATE+BUILDER&font=rajdhani";
        document.getElementById('preview-label').innerText = "جاري انتظار اختيار القطع...";
    }
}

// --- 8. الحفظ والاسترجاع (LocalStorage) ---
function saveBuild() {
    const buildState = {};
    componentIds.forEach(id => {
        buildState[id] = document.getElementById(id).value;
    });
    localStorage.setItem(storageKey, JSON.stringify(buildState));
}

function loadSavedBuild() {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        try {
            const buildState = JSON.parse(saved);
            componentIds.forEach(id => {
                if (buildState[id]) {
                    document.getElementById(id).value = buildState[id];
                }
            });
            // تحديث الواجهة بعد تحميل البيانات المحفوظة
            calculateAllMetrics();
            // تحديث الصورة لأول قطعة مختارة كمعاينة مبدئية
            const firstSelected = componentIds.find(id => document.getElementById(id).value !== "0");
            if(firstSelected) updatePreviewImage(document.getElementById(firstSelected));

        } catch (e) {
            console.error("خطأ في استرجاع التجميعة المحفوظة", e);
            localStorage.removeItem(storageKey);
        }
    }
}

