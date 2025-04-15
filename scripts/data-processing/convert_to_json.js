const fs = require("fs");
const path = require("path");
const marked = require("marked");

// Configure marked to handle tables
marked.use({ gfm: true });

async function convertToJson(markdownPath) {
  try {
    // Read the markdown file
    const markdown = fs.readFileSync(markdownPath, "utf-8");
    const tokens = marked.lexer(markdown);

    const result = {
      title: "",
      author: "",
      class: "",
      medications: [],
      functional_foods: [],
    };

    let currentCategory = "";
    let currentSubCategory = "";

    for (const token of tokens) {
      if (token.type === "heading") {
        if (token.depth === 1) {
          result.title = token.text;
        } else if (token.depth === 2) {
          if (token.text.includes("Họ và tên")) {
            result.author = token.text.split(":")[1].trim();
          } else if (token.text.includes("Lớp")) {
            result.class = token.text.split(":")[1].trim();
          } else {
            currentCategory = token.text;
            currentSubCategory = "";
          }
        } else if (token.depth === 3) {
          currentSubCategory = token.text;
        }
      } else if (token.type === "table") {
        const headers = token.header.map((h) => h.text.toLowerCase());

        for (const row of token.rows) {
          const item = {};

          // Map each cell to its corresponding header
          row.forEach((cell, index) => {
            const header = headers[index];
            if (header) {
              item[header] = cell.text.trim();
            }
          });

          // Add category information
          if (currentCategory.includes("Thực phẩm chức năng")) {
            result.functional_foods.push(item);
          } else {
            item.category = currentCategory;
            if (currentSubCategory) {
              item.subcategory = currentSubCategory;
            }
            result.medications.push(item);
          }
        }
      }
    }

    // Write the JSON file
    const outputPath = path.join(
      __dirname,
      "../../src/data/medication_list.json"
    );
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
    console.log("Successfully converted markdown to JSON");
    console.log(`Output saved to: ${outputPath}`);
  } catch (error) {
    console.error("Error converting markdown to JSON:", error);
  }
}

// Run the conversion
convertToJson(path.join(__dirname, "../../src/data/medication_list.md"));
