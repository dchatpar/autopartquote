// Dakshin Trading - Core Constants

export const BRAND_PATTERNS = {
    Toyota: /^(04|11|12|13|15|16|22|23|28|43|48|51|52|53|57|67|75|76|81|85|87|90)/,
    Honda: /^(17|18|19|30|31|32|33|34|35|36|37|38|39)/,
    Mitsubishi: /^(MD|MR|MN|MB)/i,
    Mercedes: /^(A|B|C|E|S|GL|ML|GLE|GLS)\d{3}/i,
    BMW: /^(11|12|13|14|15|16|17|18|31|32|33|34|35|36|37|38|41|42|43|44|45|46|47|48|51|52|53|54|55|56|57|58|61|62|63|64|65|66|67|68|71|72|73|74|75|76|77|78|81|82|83|84|85|86|87|88)/,
    Volkswagen: /^(VW|1K|5K|3C|5N)/i,
    Audi: /^(8K|8P|8V|4G|4F)/i,
    Nissan: /^(21|24|25|26|27|40|41|42|44|45|46|47|49)/,
    Mazda: /^(B|C|D|E|F|G|H|L|N|P|R|S|T|U|V|W|Y|Z)\d{3}/i,
    Isuzu: /^(8-9|1-5)/,
    Suzuki: /^(09|33|34|35|36|37|38|39)/,
    Scania: /^(14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29)/,
    Ford: /^(F|E|C|D|G|H|J|K|L|M|N|P|R|S|T|U|V|W|Y|Z)\d{2}/i,
    Mopar: /^(04|05|06|52|53|55|68)/,
} as const;

export const BRAND_LOGOS = {
    Toyota: "/brands/toyota.svg",
    Honda: "/brands/honda.svg",
    Mitsubishi: "/brands/mitsubishi.svg",
    Mercedes: "/brands/mercedes.svg",
    BMW: "/brands/bmw.svg",
    Volkswagen: "/brands/volkswagen.svg",
    Audi: "/brands/audi.svg",
    Nissan: "/brands/nissan.svg",
    Mazda: "/brands/mazda.svg",
    Isuzu: "/brands/isuzu.svg",
    Suzuki: "/brands/suzuki.svg",
    Scania: "/brands/scania.svg",
    Ford: "/brands/ford.svg",
    Mopar: "/brands/mopar.svg",
} as const;

export const TAX_RATES = {
    UAE: 0.05,
    KSA: 0.15,
    UK: 0.20,
    India: 0.18,
    Africa: 0.15, // Default for African markets
} as const;

export const PART_CATEGORIES = [
    "Engine Components",
    "Transmission & Drivetrain",
    "Suspension & Steering",
    "Brake System",
    "Electrical & Ignition",
    "Cooling System",
    "Fuel System",
    "Exhaust System",
    "Body Panels & Exterior",
    "Interior Components",
    "Lighting",
    "Filters & Fluids",
    "Gaskets & Seals",
    "Bearings & Bushings",
    "Fasteners & Hardware",
    "Lubricants",
    "Other",
] as const;

export const CATEGORY_KEYWORDS = {
    "Engine Components": ["piston", "cylinder", "valve", "camshaft", "crankshaft", "timing", "chain", "belt"],
    "Transmission & Drivetrain": ["transmission", "clutch", "drive", "axle", "differential", "cv joint"],
    "Suspension & Steering": ["shock", "strut", "spring", "arm", "knuckle", "tie rod", "ball joint", "stabilizer"],
    "Brake System": ["brake", "caliper", "rotor", "pad", "drum", "master cylinder"],
    "Electrical & Ignition": ["coil", "sensor", "switch", "relay", "alternator", "starter", "battery"],
    "Cooling System": ["radiator", "thermostat", "water pump", "hose", "coolant"],
    "Fuel System": ["fuel pump", "injector", "filter", "tank", "line"],
    "Exhaust System": ["muffler", "catalytic", "exhaust", "manifold", "pipe"],
    "Body Panels & Exterior": ["bumper", "fender", "hood", "door", "panel", "grille", "mirror"],
    "Interior Components": ["seat", "dashboard", "console", "trim", "carpet"],
    "Lighting": ["headlight", "taillight", "lamp", "bulb", "lens"],
    "Filters & Fluids": ["oil filter", "air filter", "cabin filter", "oil", "fluid"],
    "Gaskets & Seals": ["gasket", "seal", "o-ring", "boot"],
    "Bearings & Bushings": ["bearing", "bush", "bushing"],
    "Fasteners & Hardware": ["bolt", "nut", "screw", "clip", "bracket"],
    "Lubricants": ["oil", "grease", "lubricant", "fluid"],
} as const;

export const REFERENCE_PREFIX = "DTSB";

export const MARGIN_THRESHOLD = 0.15; // 15% minimum margin

export const IMAGE_SCRAPER_CONFIG = {
    concurrentWorkers: 3,
    minImageWidth: 500,
    maxRetries: 2,
    timeout: 10000,
    watermarkBlacklist: ["watermark", "shutterstock", "gettyimages", "alamy", "istockphoto"],
    preferredDomains: ["toyota", "honda", "partsouq", "megazip", "amayama", "genuine"],
} as const;

export const PDF_CONFIG = {
    maxFileSizeMB: 10,
    rowsPerPage: 25,
    imageQuality: 0.8,
    thumbnailSize: 40,
} as const;
