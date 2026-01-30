import requests
import json

def fetch_hardware():
    url = 'https://query.wikidata.org/sparql'
    
    # استعلام مخصص لجلب موديلات المعالجات والكروت بالاسم
    query = """
    SELECT ?itemLabel ?type WHERE {
      {
        ?item wdt:P31/wdt:P279* wd:Q1616142. # موديلات معالجات
        BIND("cpu" AS ?type)
      } UNION {
        ?item wdt:P31/wdt:P279* wd:Q12857444. # موديلات كروت شاشة
        BIND("gpu" AS ?type)
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    } LIMIT 100
    """
    
    print("⏳ جاري سحب الأسماء الحقيقية من Wikidata... قد يستغرق دقيقة...")
    
    try:
        response = requests.get(url, params={'format': 'json', 'query': query}, timeout=30)
        data = response.json()
        
        cpus = []
        gpus = []

        for result in data['results']['bindings']:
            name = result['itemLabel']['value']
            # تصفية الأسماء الغريبة (اختياري)
            if "Q" in name and name[1:].isdigit(): continue 
            
            item_type = result['type']['value']
            if item_type == "cpu":
                cpus.append({"name": name, "price": 299})
            else:
                gpus.append({"name": name, "price": 499})

        # إذا فشل Wikidata في جلب الأسماء، نضع قائمة احتياطية قوية
        if not cpus:
            cpus = [
                {"name": "Intel Core i9-14900K", "price": 580},
                {"name": "AMD Ryzen 7 7800X3D", "price": 450},
                {"name": "Intel Core i5-13600K", "price": 320},
                {"name": "AMD Ryzen 5 7600X", "price": 230}
            ]
        if not gpus:
            gpus = [
                {"name": "NVIDIA GeForce RTX 4090", "price": 1600},
                {"name": "NVIDIA GeForce RTX 4070 Super", "price": 600},
                {"name": "AMD Radeon RX 7800 XT", "price": 500},
                {"name": "NVIDIA GeForce RTX 4060", "price": 300}
            ]

        full_data = {
            "cpus": cpus,
            "gpus": gpus,
            "motherboards": [
                {"name": "ASUS ROG Strix Z790", "price": 350},
                {"name": "MSI B650 Tomahawk", "price": 200},
                {"name": "Gigabyte B760M DS3H", "price": 110}
            ],
            "ram": [
                {"name": "Corsair Vengeance 32GB DDR5", "price": 120},
                {"name": "G.Skill Trident Z5 16GB", "price": 80}
            ],
            "storage": [
                {"name": "Samsung 990 Pro 1TB", "price": 100},
                {"name": "Crucial P3 2TB", "price": 130}
            ],
            "psu": [
                {"name": "EVGA 750W Gold", "price": 100},
                {"name": "Corsair RM1000x", "price": 180}
            ]
        }

        with open('parts.json', 'w', encoding='utf-8') as f:
            json.dump(full_data, f, indent=4, ensure_ascii=False)
        
        print(f"✅ تم التحديث! عدد المعالجات: {len(cpus)} | عدد الكروت: {len(gpus)}")

    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    fetch_hardware()

