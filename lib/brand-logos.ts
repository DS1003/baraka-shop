/** Fallback logos when Brand.image is empty in the database. */
const BRAND_LOGOS: Record<string, string> = {
    ASUS: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/512px-ASUS_Logo.svg.png',
    LOGITECH: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Logitech_logo.svg/512px-Logitech_logo.svg.png',
    'TP-LINK': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/TP-Link_logo.svg/512px-TP-Link_logo.svg.png',
    TPLINK: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/TP-Link_logo.svg/512px-TP-Link_logo.svg.png',
    'BARAKA SN': 'https://baraka.sn/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png',
    BARAKA: 'https://baraka.sn/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png',
    APPLE: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    SAMSUNG: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Samsung_old_logo_before_year_2015.svg/512px-Samsung_old_logo_before_year_2015.svg.png',
    SONY: 'https://www.freepnglogos.com/uploads/sony-png-logo/brand-sony-png-logo-5.png',
    DELL: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg',
    HP: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg',
    LG: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/LG_logo_%282014%29.svg/512px-LG_logo_%282014%29.svg.png',
    CANON: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Canon_logo_vector.png',
    LENOVO: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg',
}

function normalizeBrandKey(name: string): string {
    return name.trim().toUpperCase().replace(/\s+/g, ' ')
}

export function getBrandLogoUrl(name: string, image?: string | null): string | null {
    if (image?.trim()) return image.trim()
    return BRAND_LOGOS[normalizeBrandKey(name)] ?? null
}
