# Discovered 2026-06-05 by running Task 2 discovery script against madr.gov.dz/transparency
# Each entry: (table_id, [column_names_in_order])
# Column names are free-form labels matching the Arabic/French header text's meaning
#
# Live row counts observed (2026-06-05):
#   plant_products:         673
#   seedlings:              384
#   agrochemicals:         5058
#   potato_seeds:            35
#   seeds:                 2866
#   vet_authorizations:     161
#   vet_distributors:       249
#   vet_medicine_importers: 106
#
# Arabic headers (original order):
#   plant_products:    اسم الشركة للمستورد | الاسم المعروف | اسم الصنف | بلد الإنتاج | منطقة الإنتاج | فئة المواد النباتية المستوردة
#   seedlings:         اسم الشركة للمستورد | منطقة الغرس المخصصة للمواد النباتية | الاسم المعروف | اسم الصنف | طبيعة المادة | بلد الإنتاج | منطقة الإنتاج | لقب الممون | اسم الممون
#   agrochemicals:     اسم الشركة | التخصص التجاري (الاسم الكامل للمنتج التجاري) | المادة الفعالة (المواد الفعالة والتركيزات) | طبيعة المنتج | بلد المنشأ | اسم المزود | عنوان المزود | اسم المنتج | عنوان المنتج
#   potato_seeds:      لقب للمستورد | اسم للمستورد | اسم الشركة للمستورد | الاسم المعروف | اسم الصنف | طبيعة المادة | بلد الإنتاج | منطقة الإنتاج | لقب الممون | اسم الممون | فئة المواد النباتية المستوردة
#   seeds:             لقب للمستورد | اسم للمستورد | اسم الشركة للمستورد | العنوان المستورد | البريد الإلكتروني المستورد | رقم الهاتف المستورد | الاسم المعروف | اسم الصنف | طبيعة المادة | بلد الإنتاج | منطقة الإنتاج | لقب الممون | اسم الممون
#   vet_authorizations: N° Dérogation sanitaire d'importation | Opérateurs | Nature du produit | N° D'agrément du benificiaire
#   vet_distributors:  N° | Nom de la société | Adresse du siège social | wilaya
#   vet_medicine_importers: N° | NOM DE LA SOCIETE | Commune / Wilaya d'inscription

TABLE_MAP = {
    "plant_products": ("table_1", [
        "company",
        "known_name",
        "variety",
        "country_of_origin",
        "production_zone",
        "category",
    ]),
    "seedlings": ("table_2", [
        "company",
        "planting_zone",
        "known_name",
        "variety",
        "material_type",
        "country_of_origin",
        "production_zone",
        "supplier_surname",
        "supplier_name",
    ]),
    "agrochemicals": ("table_3", [
        "company",
        "commercial_name",
        "active_substance",
        "product_type",
        "country_of_origin",
        "supplier_name",
        "supplier_address",
        "manufacturer_name",
        "manufacturer_address",
    ]),
    "potato_seeds": ("table_4", [
        "importer_surname",
        "importer_name",
        "company",
        "known_name",
        "variety",
        "material_type",
        "country_of_origin",
        "production_zone",
        "supplier_surname",
        "supplier_name",
        "category",
    ]),
    "seeds": ("table_5", [
        "importer_surname",
        "importer_name",
        "company",
        "importer_address",
        "importer_email",
        "importer_phone",
        "known_name",
        "variety",
        "material_type",
        "country_of_origin",
        "production_zone",
        "supplier_surname",
        "supplier_name",
    ]),
    "vet_authorizations": ("table_6", [
        "authorization_number",
        "company",
        "product_type",
        "agreement_number",
    ]),
    "vet_distributors": ("table_7", [
        "number",
        "company",
        "address",
        "wilaya",
    ]),
    "vet_medicine_importers": ("table_8", [
        "number",
        "company",
        "location",
    ]),
}

# DataTables mode: client_side | server_side
# Confirmed client-side: "serverSide":false in page JS, all rows present in initial HTML.
# No AJAX endpoints found. All 8 tables fully rendered on page load.
DATATABLES_MODE = "client_side"
