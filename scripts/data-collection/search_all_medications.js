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
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    });

    // Create a new page
    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
    );

    // Process each medication
    for (const medication of data.medications) {
      try {
        // Construct search query for medication image
        const searchQuery =
          `${medication.name} ${medication.concentration} ${medication.dosage_form} medication pill tablet`.trim();
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
          searchQuery
        )}&tbm=isch`;

        console.log(`\nProcessing medication: ${medication.name}`);
        console.log(`Search URL: ${searchUrl}`);

        // Navigate to Google Images search page
        console.log("Navigating to Google Images...");
        await page.goto(searchUrl, {
          waitUntil: "networkidle2",
          timeout: 60000,
        });

        // Accept cookies if popup appears (common in EU)
        try {
          const acceptButton = await page.$('button:has-text("Accept all")');
          if (acceptButton) {
            await acceptButton.click();
            await page.waitForNavigation({ waitUntil: "networkidle2" });
          }
        } catch (cookieError) {
          console.log("No cookie consent needed or already accepted");
        }

        // Wait for image results to load
        console.log("Waiting for image results to load...");
        await page.waitForSelector("img", { timeout: 10000 });
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Extract the image src from the first few results
        console.log("Extracting image src...");
        const imageSrc = await page.evaluate(() => {
          // Find all thumbnail images
          const imgElements = Array.from(document.querySelectorAll("img"));

          // Skip Google's UI images by filtering for larger images (likely actual search results)
          const resultImages = imgElements.filter((img) => {
            const width = parseInt(img.width);
            const height = parseInt(img.height);
            // Minimum size for actual result images
            return width > 100 && height > 100;
          });

          // Get the first good image
          const bestImage = resultImages[0];

          if (bestImage) {
            return {
              src: bestImage.src,
              alt: bestImage.alt || "",
            };
          }

          return null;
        });

        if (
          imageSrc &&
          imageSrc.src &&
          !imageSrc.src.includes("data:image/gif;base64")
        ) {
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
          console.log(`No suitable image found for ${medication.name}`);

          // Try a more generic search
          const genericSearchQuery = `${medication.name} medication`.trim();
          const genericSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
            genericSearchQuery
          )}&tbm=isch`;

          console.log(`Trying generic search: ${genericSearchUrl}`);

          await page.goto(genericSearchUrl, {
            waitUntil: "networkidle2",
            timeout: 60000,
          });

          await page.waitForSelector("img", { timeout: 10000 });
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const genericImageSrc = await page.evaluate(() => {
            const imgElements = Array.from(document.querySelectorAll("img"));
            const resultImages = imgElements.filter((img) => {
              const width = parseInt(img.width);
              const height = parseInt(img.height);
              return width > 100 && height > 100;
            });

            const bestImage = resultImages[0];

            if (bestImage) {
              return {
                src: bestImage.src,
                alt: bestImage.alt || "",
                note: "From generic search",
              };
            }

            return null;
          });

          if (
            genericImageSrc &&
            genericImageSrc.src &&
            !genericImageSrc.src.includes("data:image/gif;base64")
          ) {
            console.log(`Found generic image for ${medication.name}`);

            imageResults.push({
              medication: medication.name,
              concentration: medication.concentration,
              dosage_form: medication.dosage_form,
              category: medication.category,
              subcategory: medication.subcategory,
              image: genericImageSrc,
            });
          } else {
            // Add empty result if both searches failed
            imageResults.push({
              medication: medication.name,
              concentration: medication.concentration,
              dosage_form: medication.dosage_form,
              category: medication.category,
              subcategory: medication.subcategory,
              image: null,
            });
          }
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

        // Add delay between searches (important for Google to avoid being blocked)
        const delay = 5000 + Math.floor(Math.random() * 5000); // 5-10 second random delay
        console.log(`Waiting ${delay / 1000} seconds before next search...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
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
          await page.reload({ waitUntil: "networkidle2" });
        } catch (reloadError) {
          console.error("Error reloading page:", reloadError.message);

          // If reload fails, try to create a new page
          try {
            await page.close();
            page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            await page.setUserAgent(
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
            );
          } catch (pageError) {
            console.error("Error creating new page:", pageError.message);
          }
        }

        // Wait longer after an error
        const errorDelay = 10000 + Math.floor(Math.random() * 5000);
        console.log(
          `Error encountered, waiting ${errorDelay / 1000} seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, errorDelay));
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
