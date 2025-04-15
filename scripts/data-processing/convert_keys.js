const fs = require("fs");
const path = require("path");
const medicationMapping = require("./medication_mapping");

function convertKeys(obj, mapping) {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeys(item, mapping));
  } else if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = mapping[key] || key;
      newObj[newKey] = convertKeys(value, mapping);
    }
    return newObj;
  }
  return obj;
}

// Read the original JSON file
const inputPath = path.join(__dirname, "../../src/data/medication_list.json");
const outputPath = path.join(
  __dirname,
  "../../src/data/medication_list_en.json"
);

try {
  const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const convertedData = convertKeys(data, medicationMapping);

  // Write the converted JSON file
  fs.writeFileSync(outputPath, JSON.stringify(convertedData, null, 2), "utf8");
  console.log("Successfully converted keys to English");
  console.log(`Output saved to: ${outputPath}`);
} catch (error) {
  console.error("Error converting keys:", error);
}
