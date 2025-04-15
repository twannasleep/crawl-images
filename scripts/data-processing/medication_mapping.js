const medicationMapping = {
  // Top level fields
  "title": "title",
  "author": "author",
  "class": "class",
  "medications": "medications",
  "functional_foods": "functional_foods",

  // Medication fields
  "stt": "id",
  "tên thuốc": "name",
  "nồng độ/hàm lượng": "concentration",
  "hoạt chất": "active_ingredient",
  "dạng bào chế": "dosage_form",
  "xuất xứ": "origin",
  "category": "category",
  "subcategory": "subcategory",

  // Functional food fields
  "tên tpcn": "name",
  "dạng": "form",
  "quy cách đóng gói": "packaging",
  "nsx": "manufacturer"
};

module.exports = medicationMapping; 