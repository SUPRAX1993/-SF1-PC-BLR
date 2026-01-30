// جلب البيانات من ملف JSON
fetch('builds.json')
    .then(response => response.json())
    .then(data => {
        const app = document.getElementById('app');
        app.innerHTML = ''; // مسح كلمة "جاري التحميل"

        data.forEach(build => {
            const card = `
                <div class="card">
                    <h3>${build.title}</h3>
                    <p>السعر المخطط: <strong>${build.price}</strong></p>
                    <ul>
                        ${build.specs.map(spec => `<li>${spec}</li>`).join('')}
                    </ul>
                    <a href="${build.link}" target="_blank" class="buy-btn">تفاصيل الشراء (Affiliate)</a>
                </div>
            `;
            app.innerHTML += card;
        });
    })
    .catch(err => console.error('خطأ في تحميل البيانات:', err));

