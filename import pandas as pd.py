import pandas as pd

# Die erweiterten KMU-Mockdaten (inklusive irrelevanter kaufmännischer Felder zum Testen des Pydantic-Filters)
mock_data = [
    {"SKU": "LOC-400-25", "Title": "LOCTITE IND-SEAL 400", "EAN": "04001234987654", "Weight": "25.000 KG", "Parent ID": None, "Supplier Email": None, "TARIC": "35069190", "Country of Origin": "DE", "Material": None, "EK-Preis": 145.50, "VK-Preis": 299.00, "Lagerbestand": 12, "Warengruppe": "Industrieklebstoffe", "Letzte Änderung": "2026-08-15"},
    {"SKU": "RAW-POL-01", "Title": "Vorpolymer Polyol Type P-40", "EAN": None, "Weight": None, "Parent ID": "LOC-400-25", "Supplier Email": "rechnungseingang@covestro.corp", "TARIC": "39072020", "Country of Origin": "DE", "Material": "Polyurethan-Prepolymer", "EK-Preis": 4.50, "VK-Preis": None, "Lagerbestand": 1500, "Warengruppe": "Rohstoffe", "Letzte Änderung": "2026-08-10"},
    {"SKU": "RAW-CAL-02", "Title": "Kreide-Füllstoff Calcit Micron", "EAN": None, "Weight": None, "Parent ID": "LOC-400-25", "Supplier Email": "info.germany@omya.corp", "TARIC": "28365000", "Country of Origin": "FR", "Material": "Calciumcarbonat", "EK-Preis": 0.80, "VK-Preis": None, "Lagerbestand": 5000, "Warengruppe": "Füllstoffe", "Letzte Änderung": "2026-07-22"},
    {"SKU": "TER-939-310", "Title": "Teroson MS 939", "EAN": "04001234123456", "Weight": "310 ml", "Parent ID": None, "Supplier Email": None, "TARIC": "32141010", "Country of Origin": "DE", "Material": None, "EK-Preis": 6.20, "VK-Preis": 14.95, "Lagerbestand": 340, "Warengruppe": "Dichtstoffe", "Letzte Änderung": "2026-09-01"},
    {"SKU": "RAW-SIL-05", "Title": "Silanterminiertes Polymer", "EAN": None, "Weight": None, "Parent ID": "TER-939-310", "Supplier Email": "sales@basf.com", "TARIC": "39119019", "Country of Origin": "BE", "Material": "SMP-Polymer", "EK-Preis": 2.10, "VK-Preis": None, "Lagerbestand": 800, "Warengruppe": "Rohstoffe", "Letzte Änderung": "2026-08-20"},
    {"SKU": "RAW-CAL-03", "Title": "Calciumcarbonat", "EAN": None, "Weight": None, "Parent ID": "TER-939-310", "Supplier Email": "info@imerys.com", "TARIC": "28365000", "Country of Origin": "IT", "Material": "Calciumcarbonat (gecoated)", "EK-Preis": 0.95, "VK-Preis": None, "Lagerbestand": 2200, "Warengruppe": "Füllstoffe", "Letzte Änderung": "2026-08-21"}
]

df = pd.DataFrame(mock_data)

# Erstellt die Excel-Datei für den FastAPI-Upload-Test (benötigt openpyxl)
file_name = "mock_kmu_export_extended.xlsx"
df.to_excel(file_name, index=False)

print(f"Erfolg: {file_name} wurde generiert und ist bereit für den API-Upload.")