# Bulk Image Scraping for Dakshin Auto Parts

This script uses your Python image scraper to download high-quality images for all 80 parts.

## Prerequisites

1. Python 3.x installed
2. Required packages:
```bash
pip install beautifulsoup4 requests lxml pillow numpy
```

## Usage

### Step 1: Run the bulk scraper

```bash
cd C:\Users\dchat\Documents\autopartquote\scripts
python bulk-scrape-parts.py
```

This will:
- Scrape images for all 80 parts
- Save them to `public/parts/` folder
- Create an `index.json` mapping part numbers to image URLs
- Take approximately 20-30 minutes

### Step 2: Deploy to Vercel

Once scraping is complete:

```bash
cd C:\Users\dchat\Documents\autopartquote
vercel --prod
```

Vercel will upload the `public/parts/` folder with all images.

### Step 3: Update the app to use local images

The app will automatically use images from `/parts/` folder.

## What It Does

1. **Searches Multiple Sources:**
   - DuckDuckGo Images
   - Google Images (fallback)
   - Wikimedia Commons

2. **Quality Filters:**
   - Minimum 1280x720 resolution (HD mode)
   - Blur detection
   - Watermark filtering
   - Duplicate detection

3. **Smart Queries:**
   - Combines part number + description + "Toyota auto part"
   - Auto-simplifies if no results found
   - Desperation mode with relaxed filters

## Output

Images will be saved as:
```
public/parts/04427-42180_00_abc123.jpg
public/parts/11115-24040_00_def456.jpg
...
```

Plus an index file:
```json
{
  "04427-42180": "/parts/04427-42180_00_abc123.jpg",
  "11115-24040": "/parts/11115-24040_00_def456.jpg"
}
```

## Troubleshooting

### If scraping fails:
- Check internet connection
- Verify Python packages are installed
- Try running for a single part first:
  ```bash
  python C:\Users\dchat\Desktop\scripts\image_scraper.py "04427-42180 BOOT KIT Toyota" --limit 1 --output C:\Users\dchat\Documents\autopartquote\public\parts --hd
  ```

### If images don't show on Vercel:
- Ensure `public/parts/` folder is committed to git
- Check Vercel deployment logs
- Verify image URLs in browser console

## Alternative: Quick Test (5 parts)

To test with just 5 parts first:

```python
# Edit bulk-scrape-parts.py
# Change PARTS_LIST to only include first 5 items
PARTS_LIST = PARTS_LIST[:5]
```

Then run the script.
