const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function searchAllMedications() {
  let browser = null;

  try {
    // Read the JSON file
    const data = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../../src/data/medication_list_en.json"),
        "utf8"
      )
    );
    console.log(`Found ${data.medications.length} medications to process`);

    // Create a list to store image URLs
    const imageResults = [];

    // Launch browser
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // Create a new page
    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Process each medication
    for (const medication of data.medications) {
      try {
        // Construct search query
        const searchQuery =
          `${medication.name} ${medication.concentration} ${medication.dosage_form}`.trim();
        const searchUrl = `https://nhathuoclongchau.com.vn/tim-kiem?s=${encodeURIComponent(
          searchQuery
        )}`;

        console.log(`\nProcessing medication: ${medication.name}`);
        console.log(`Search URL: ${searchUrl}`);

        // Navigate to search page
        console.log("Navigating to search page...");
        await page.goto(searchUrl, {
          waitUntil: "networkidle0",
          timeout: 60000,
        });

        // Wait for content to load
        console.log("Waiting for content to load...");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Extract the image src
        console.log("Extracting image src...");
        const imageSrc = await page.evaluate(() => {
          // Find the first image with the specific class
          const imgElement = document.querySelector(
            "img.inline-block.h-auto.w-\\[140px\\].md\\:w-\\[160px\\]"
          );

          if (imgElement) {
            return {
              src: imgElement.src,
              alt: imgElement.alt || "",
            };
          }

          // If specific class not found, try a more general selector
          const anyImg = document.querySelector(".product-item img");
          if (anyImg) {
            return {
              src: anyImg.src,
              alt: anyImg.alt || "",
              note: "Used generic selector",
            };
          }

          return null;
        });

        if (imageSrc) {
          console.log(`Found image for ${medication.name}`);

          // Add to results list
          imageResults.push({
            medication: medication.name,
            concentration: medication.concentration,
            dosage_form: medication.dosage_form,
            category: medication.category,
            subcategory: medication.subcategory,
            image: imageSrc,
          });
        } else {
          console.log(`No image found for ${medication.name}`);

          // Add empty result
          imageResults.push({
            medication: medication.name,
            concentration: medication.concentration,
            dosage_form: medication.dosage_form,
            category: medication.category,
            subcategory: medication.subcategory,
            image: null,
          });
        }

        // Save results after each medication (in case of crash)
        const resultsPath = path.join(
          __dirname,
          "../../src/data/image_urls.json"
        );
        fs.writeFileSync(
          resultsPath,
          JSON.stringify(imageResults, null, 2),
          "utf8"
        );
        console.log(
          `Saved progress: ${imageResults.length}/${data.medications.length} medications processed`
        );

        // Add delay between searches
        console.log("Waiting 3 seconds before next search...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`Error processing ${medication.name}:`, error.message);

        // Add error result
        imageResults.push({
          medication: medication.name,
          concentration: medication.concentration,
          dosage_form: medication.dosage_form,
          category: medication.category,
          subcategory: medication.subcategory,
          image: null,
          error: error.message,
        });

        // Save progress in case of error
        const resultsPath = path.join(
          __dirname,
          "../../src/data/image_urls.json"
        );
        fs.writeFileSync(
          resultsPath,
          JSON.stringify(imageResults, null, 2),
          "utf8"
        );

        // Try to handle potential page hang
        try {
          await page.reload({ waitUntil: "networkidle0" });
        } catch (reloadError) {
          console.error("Error reloading page:", reloadError.message);

          // If reload fails, try to create a new page
          try {
            await page.close();
            page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            await page.setUserAgent(
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            );
          } catch (pageError) {
            console.error("Error creating new page:", pageError.message);
          }
        }

        // Wait longer after an error
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    console.log("\nSearch completed!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser closed");
    }
  }
}

// Run the search
searchAllMedications();
