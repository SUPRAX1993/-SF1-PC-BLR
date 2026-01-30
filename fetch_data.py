import requests
import json

def fetch_hardware():
    url = 'https://query.wikidata.org/sparql'
    
    # استعلام سريع يجلب أفضل 30 معالج و 30 كارت شاشة
    query = """
    SELECT ?itemLabel ?type WHERE {
      {
        ?item wdt:P31 wd:Q1616142. # CPUs
        BIND("cpu" AS ?type)
      } UNION {
        ?item wdt:P31 wd:Q12857444. # GPUs
        BIND("gpu" AS ?type)
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    } LIMIT 60
    """
    
    print("⏳ جاري سحب البيانات من Wikidata... انتظر ثواني...")
    
    try:
        response = requests.get(url, params={'format': 'json', 'query': query}, timeout=15)
        data = response.json()
        
        cpus = []
        gpus = []

        for result in data['results']['bindings']:
            name = result['itemLabel']['value']
            item_type = result['type']['value']
            
            if item_type == "cpu":
                cpus.append({"name": name, "price": 250})
            else:
                gpus.append({"name": name, "price": 500})

        # تجهيز هيكل البيانات الكامل
        full_data = {
            "cpus": cpus,
            "gpus": gpus,
            "motherboards": [
                {"name": "B760M Gaming", "price": 150},
                {"name": "X670E Motherboard", "price": 300}
            ],
            "ram": [
                {"name": "16GB DDR4", "price": 50},
                {"name": "32GB DDR5", "price": 120}
            ],
            "storage": [
                {"name": "1TB NVMe SSD", "price": 80},
                {"name": "2TB HDD", "price": 60}
            ],
            "psu": [
                {"name": "650W Gold", "price": 90},
                {"name": "850W Platinum", "price": 160}
            ]
        }

        # حفظ البيانات في الملف
        with open('parts.json', 'w', encoding='utf-8') as f:
            json.dump(full_data, f, indent=4, ensure_ascii=False)
        
        print(f"✅ تم بنجاح! جلبنا {len(cpus)} معالج و {len(gpus)} كارت شاشة.")
        print("🚀 الآن ارفع الملفات لـ GitHub.")

    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    fetch_hardware()

