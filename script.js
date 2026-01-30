// تحميل البيانات
fetch('parts.json')
    .then(res => res.json())
    .then(data => {
        // ملء القوائم
        populateSelect('cpu-select', data.cpus);
        populateSelect('gpu-select', data.gpus);
        populateSelect('mobo-select', data.motherboards);
        populateSelect('ram-select', data.ram);
        populateSelect('storage-select', data.storage);
        populateSelect('cooler-select', data.coolers);
        populateSelect('case-select', data.cases);
        populateSelect('psu-select', data.psu);

        // إضافة مستمعي الأحداث لتحديث الصورة والسعر عند التغيير
        setupListeners();
    })
    .catch(err => console.error("Error loading parts:", err));

function populateSelect(elementId, items) {
    const select = document.getElementById(elementId);
    // إضافة خيار افتراضي فارغ
    select.innerHTML = '<option value="0" data-image="https://placehold.co/400x400/eee/999?text=اختر+قطعة" data-name="اختر قطعة">-- اختر قطعة --</option>';
    
    items.forEach(item => {
        // نقوم بتخزين السعر والصورة والاسم داخل "data attributes" في العنصر
        const option = document.createElement('option');
        option.value = item.price;
        option.text = `${item.name} (${item.price}$)`;
        option.dataset.image = item.image; // تخزين رابط الصورة
        option.dataset.name = item.name;   // تخزين الاسم
        select.appendChild(option);
    });
}

function setupListeners() {
    const ids = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
    
    ids.forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            calculateTotal();
            updatePreview(this); // تحديث الصورة بناءً على آخر قطعة تم لمسها
        });
    });
}

function updatePreview(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const imgUrl = selectedOption.dataset.image;
    const name = selectedOption.dataset.name;

    // تحديث الصورة والنص في الصندوق الجانبي
    if (imgUrl) {
        document.getElementById('part-image').src = imgUrl;
        document.getElementById('part-name-display').innerText = name;
    }
}

function calculateTotal() {
    const ids = ['cpu-select', 'gpu-select', 'mobo-select', 'ram-select', 'storage-select', 'cooler-select', 'case-select', 'psu-select'];
    let total = 0;
    
    ids.forEach(id => {
        const val = parseInt(document.getElementById(id).value) || 0;
        total += val;
    });
    
    document.getElementById('total-price').innerText = total;
}

