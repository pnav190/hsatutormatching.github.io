const fs = require('fs');
const puppeteer = require('puppeteer');

// Read tutors from Dynamic.html and extract tutorocean links
function getTutorOceanLinks() {
  const dynamicHtml = fs.readFileSync('Dynamic.html', 'utf8');
  // Match all tutorocean URLs in the tutors array
  const regex = /"tutorocean":\s*"(https:\/\/hsatutoring\.tutorocean\.com\/host\/[^"]+)"/g;
  const links = [];
  let match;
  while ((match = regex.exec(dynamicHtml)) !== null) {
    links.push(match[1]);
  }
  return links;
}

const allTutorProfiles = getTutorOceanLinks();
const BATCH_SIZE = 5;
const results = [];

console.log(`Total TutorOcean profile URLs to be scraped: ${allTutorProfiles.length}`);
console.log(`Processing in batches of ${BATCH_SIZE}`);

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Process tutors in batches of 5
  for (let i = 0; i < allTutorProfiles.length; i += BATCH_SIZE) {
    const batch = allTutorProfiles.slice(i, i + BATCH_SIZE);
    console.log(`\nProcessing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(allTutorProfiles.length/BATCH_SIZE)}: ${batch.length} profiles`);
    
    for (const url of batch) {
      const page = await browser.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        // Wait for the first span element to appear (tutor's name)
        await page.waitForSelector('span', { timeout: 15000 });
        // Extract the tutor's name from the first span
        const name = await page.$eval('span', el => el.textContent.trim());
        // Wait for packages list to appear (if any)
        await page.waitForSelector('[data-test-id="packages-list"]', { timeout: 10000 }).catch(() => {});
        // Extract all package names from span elements within the packages list
        const packages = await page.$$eval(
          '[data-test-id="packages-list"] span',
          tags => tags.map(tag => tag.textContent.trim()).filter(text => text.length > 0)
        );
        results.push({ url, name, packages });
        console.log(`✓ Scraped: ${name} (${packages.length} packages)`);
      } catch (err) {
        console.error(`✗ Error scraping ${url}:`, err.message);
        try {
          await page.screenshot({ path: `error_${encodeURIComponent(url)}.png`, fullPage: true });
          console.log(`Screenshot saved for ${url}`);
        } catch (screenshotErr) {
          console.error(`Failed to take screenshot for ${url}:`, screenshotErr.message);
        }
        results.push({ url, error: err.message });
      } finally {
        await page.close();
      }
    }
    
    // Save progress after each batch
    fs.writeFileSync('tutorPackages.json', JSON.stringify(results, null, 2));
    console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1} complete. Progress saved.`);
  }

  await browser.close();

  console.log('\nScraping complete! All data saved to tutorPackages.json');
  console.log(`Total profiles processed: ${results.length}`);
})();
