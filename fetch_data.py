import requests

def get_cpus():
    url = 'https://query.wikidata.org/sparql'
    # استعلام لجلب معالجات إنتل
    query = """
    SELECT ?itemLabel WHERE {
      ?item wdt:P31 wd:Q1616142; # Intel Core
            wdt:P178 wd:Q113;    # Manufacturer: Intel
      SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
    } LIMIT 50
    """
    r = requests.get(url, params={'format': 'json', 'query': query})
    data = r.json()
    for result in data['results']['bindings']:
        print(result['itemLabel']['value'])

get_cpus()

import requests
import json

def fetch_and_update():
    url = 'https://query.wikidata.org/sparql'
    # استعلام لجلب موديلات معالجات Intel و AMD
    query = """
    SELECT ?itemLabel WHERE {
      ?item wdt:P31 wd:Q1616142. 
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    } LIMIT 100
    """
    try:
        r = requests.get(url, params={'format': 'json', 'query': query})
        data = r.json()
        
        new_cpus = []
        for result in data['results']['bindings']:
            name = result['itemLabel']['value']
            # وضع سعر افتراضي 200$ لأن Wikidata لا توفر أسعار
            new_cpus.append({"name": name, "price": 200})

        # قراءة الملف الحالي لإضافة البيانات له
        with open('parts.json', 'r') as f:
            current_data = json.load(f)

        # تحديث قائمة المعالجات فقط
        current_data['cpus'] = new_cpus

        # حفظ الملف من جديد
        with open('parts.json', 'w') as f:
            json.dump(current_data, f, indent=4)
        
        print("✅ تم تحديث ملف parts.json بـ 100 معالج من Wikidata!")
    
    except Exception as e:
        print(f"❌ حدث خطأ: {e}")

if __name__ == "__main__":
    fetch_and_update()

