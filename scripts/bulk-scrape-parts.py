#!/usr/bin/env python3
"""
Bulk Image Scraper for Dakshin Auto Parts
Uses the Universal Image Hunter to scrape all parts
"""

import os
import sys
import subprocess
from pathlib import Path

# All 80 parts from your list
PARTS_LIST = [
    ("04427-42180", "BOOT KIT, FR DRIVE"),
    ("11115-24040", "GASKET, CYLINDER"),
    ("11213-24020", "GASKET, CYLINDER"),
    ("12371-25060", "INSULATOR, ENGINE"),
    ("12372-24021", "INSULATOR, ENGINE"),
    ("13011-24040", "RING SET, PISTON"),
    ("13101-24040", "PISTON SUB-ASSY"),
    ("13549-25020", "PLATE, CHAIN"),
    ("15104-24010", "STRAINER SUB-ASSY"),
    ("15370-25020", "SOLENOID ASSY, CAM"),
    ("15785-25010", "GASKET, OIL COOLER"),
    ("16031-24011", "INLET SUB-ASSY"),
    ("22204-75040", "METER SUB-ASSY"),
    ("23101-25040", "PUMP SUB-ASSY, FUEL"),
    ("28140-21070", "HOLDER ASSY, STARTER BRUSH"),
    ("43211-33130", "KNUCKLE, STEERING"),
    ("43212-33130", "KNUCKLE, STEERING"),
    ("48158-33110", "INSULATOR, FR COIL"),
    ("48257-47020", "INSULATOR, RR COIL"),
    ("48258-47010", "INSULATOR, RR COIL"),
    ("48331-33101", "BUMPER, FR SPRING"),
    ("48619-42040", "BEARING, STRUT"),
    ("48710-42040", "ARM ASSY, RR"),
    ("48770-42050", "ARM ASSY, UPR"),
    ("48780-42070", "ARM ASSY, TRAILING"),
    ("48790-42030", "ARM ASSY, UPR"),
    ("48815-33160", "BUSH, STABILIZER"),
    ("48818-42030", "BUSH, STABILIZER, RR"),
    ("48820-42040", "LINK ASSY, FR"),
    ("51100-30880", "FRAME ASSY, FR"),
    ("51441-42200", "COVER, ENGINE UNDER"),
    ("52102-42110", "EXTENSION SUB-ASSY"),
    ("52103-42110", "EXTENSION SUB-ASSY"),
    ("52155-42050", "SUPPORT, RR BUMPER"),
    ("52156-42050", "SUPPORT, RR BUMPER"),
    ("52159-42220", "COVER, RR BUMPER"),
    ("52161-42944", "PIECE, RR BUMPER, RH"),
    ("52411-42100", "GUARD, FR BUMPER"),
    ("52437-42901", "COVER, FR BUMPER"),
    ("52438-42901", "COVER, FR BUMPER"),
    ("52535-42050", "RETAINER, FR BUMPER"),
    ("52536-42080", "RETAINER, FR BUMPER"),
    ("52562-42060", "RETAINER, RR BUMPER"),
    ("52592-42100", "SEAL, RR BUMPER"),
    ("52614-42120", "ABSORBER, FR BUMPER"),
    ("52618-42080", "ABSORBER, FR BUMPER"),
    ("53112-42140", "GRILLE, RADIATOR"),
    ("53113-42121", "GRILLE, RADIATOR"),
    ("53203-42901", "SUPPORT SUB-ASSY"),
    ("53205-42906", "SUPPORT SUB-ASSY"),
    ("53285-42120", "COVER, FR BUMPER ARM"),
    ("53286-42130", "COVER, FR BUMPER ARM"),
    ("53395-42080", "SEAL, HOOD TO FR END"),
    ("53410-42140", "HINGE ASSY, HOOD, RH"),
    ("53420-42140", "HINGE ASSY, HOOD, LH"),
    ("53875-42090", "LINER, FR FENDER, RH"),
    ("53876-42100", "LINER, FR FENDER, LH"),
    ("53896-42110", "SHIELD, FR FENDER SPLASH, FR LH"),
    ("57104-42090", "MEMBER SUB-ASSY, FR"),
    ("67001-42161", "PANEL SUB-ASSY, FR"),
    ("67003-42191", "PANEL SUB-ASSY, RR"),
    ("67005-42670", "PANEL SUB-ASSY, BACK"),
    ("75301-42051", "EMBLEM SUB-ASSY"),
    ("75710-42050", "MOULDING ASSY, FR"),
    ("75720-42050", "MOULDING ASSY, FR"),
    ("75730-42050", "MOULDING ASSY, RR"),
    ("75740-42050", "MOULDING ASSY, RR"),
    ("76802-42140", "GARNISH SUB-ASSY"),
    ("81497-42010", "COVER, RR"),
    ("81498-42010", "COVER, RR"),
    ("81581-42151", "LENS & BODY, RR"),
    ("81730-58010", "LAMP ASSY, SIDE TURN"),
    ("85315-42460", "JAR, WASHER, A"),
    ("85330-47100", "MOTOR & PUMP ASSY"),
    ("85381-30240", "NOZZLE, FR WASHER"),
    ("87910-42L90", "MIRROR ASSY, OUTER"),
    ("87945-42200-A1", "COVER, OUTER MIRROR"),
    ("90311-40044", "SEAL, TYPE T OIL"),
    ("90919-02276", "COIL, IGNITION"),
    ("90919-05096", "SENSOR, CRANK"),
]

def main():
    # Paths
    scraper_path = Path(r"C:\Users\dchat\Desktop\scripts\image_scraper.py")
    output_dir = Path(r"C:\Users\dchat\Documents\autopartquote\public\parts")
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"🚀 Starting bulk image scraping for {len(PARTS_LIST)} parts")
    print(f"📁 Output directory: {output_dir}")
    print(f"🔧 Using scraper: {scraper_path}\n")
    
    success_count = 0
    failed_count = 0
    
    for i, (part_number, description) in enumerate(PARTS_LIST, 1):
        # Create search query
        query = f"{part_number} {description} Toyota auto part"
        
        print(f"[{i}/{len(PARTS_LIST)}] Scraping: {part_number} - {description}")
        
        try:
            # Run Python scraper
            cmd = [
                "python",
                str(scraper_path),
                query,
                "--limit", "1",
                "--output", str(output_dir),
                "--hd"
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60  # 60 second timeout per part
            )
            
            if result.returncode == 0:
                print(f"  ✅ Success")
                success_count += 1
            else:
                print(f"  ❌ Failed: {result.stderr[:100]}")
                failed_count += 1
                
        except subprocess.TimeoutExpired:
            print(f"  ⏱️ Timeout - skipping")
            failed_count += 1
        except Exception as e:
            print(f"  ❌ Error: {str(e)[:100]}")
            failed_count += 1
        
        print()
    
    # Summary
    print("=" * 60)
    print(f"✨ COMPLETE!")
    print(f"✅ Success: {success_count}")
    print(f"❌ Failed: {failed_count}")
    print(f"📁 Images saved to: {output_dir}")
    print("=" * 60)
    
    # Create index file
    create_image_index(output_dir)

def create_image_index(output_dir: Path):
    """Create a JSON index of all scraped images"""
    import json
    
    images = {}
    for file in output_dir.glob("*.jpg"):
        # Extract part number from filename
        filename = file.stem
        # Try to find part number pattern
        for part_number, _ in PARTS_LIST:
            clean_part = part_number.replace("-", "").lower()
            if clean_part in filename.lower():
                images[part_number] = f"/parts/{file.name}"
                break
    
    index_file = output_dir / "index.json"
    with open(index_file, "w") as f:
        json.dump(images, f, indent=2)
    
    print(f"\n📋 Created image index: {index_file}")
    print(f"   Mapped {len(images)} images to part numbers")

if __name__ == "__main__":
    main()
