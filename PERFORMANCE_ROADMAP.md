# Performance & Core Web Vitals Optimierungen

**Für dppflash.de — Implementierungs-Roadmap**

---

## 🎯 Core Web Vitals Ziele

| Metrik | Aktuell | Ziel | Priorität |
|--------|---------|------|-----------|
| LCP (Largest Contentful Paint) | ? | < 2.5s ✅ | 🔴 Kritisch |
| FID (First Input Delay) | ? | < 100ms ✅ | 🟡 Mittel |
| CLS (Cumulative Layout Shift) | ? | < 0.1 ✅ | 🟡 Mittel |

---

## 1️⃣ FONT-LOADING OPTIMIERUNG

### Empfohlene Strategie: Google Fonts mit `font-display`

```html
<!-- Added to <head> in index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
```

**Explanation:**
- `rel="preconnect"`: Browser öffnet früh Connection zu Google Fonts
- `display=swap`: System-Font wird sofort angezeigt, Google Font nachgeladen (beste UX)
- Wights spezifizieren: Nur 2 Weight-Varianten statt alle

### Alternative: System Fonts (Ultra-schnell)

```css
/* In style.css */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

h1, h2, h3 {
  font-family: 'Georgia', serif; /* Fallback für headings */
}
```

**Vorteile:**
- 0 externe Requests
- Sofort lesbar
- Lokal optimiert für OS

---

## 2️⃣ LCP-ELEMENT OPTIMIZATION

### Hero Section als LCP Target

```html
<!-- Current hero image setup (falls vorhanden) -->
<!-- BEFORE: Regular <img> -->
<img src="hero-dashboard.jpg" alt="DPP Dashboard Screenshot">

<!-- AFTER: Mit Größe-Deklaration + Eager Loading -->
<img 
  src="hero-dashboard.jpg" 
  alt="DPP Dashboard Screenshot zeigt KI-Datenextraktion"
  width="1200" 
  height="600"
  fetchpriority="high"
  loading="eager"
/>
```

**Oder mit Picture Element (Responsive):**

```html
<picture>
  <source media="(max-width: 768px)" srcset="hero-mobile.jpg">
  <source media="(min-width: 769px)" srcset="hero-desktop.jpg">
  <img 
    src="hero-desktop.jpg" 
    alt="DPP Dashboard Interface für KI-Extraktion"
    fetchpriority="high"
    width="1200"
    height="600"
  />
</picture>
```

### Next.js Future-Ready

```typescript
// Wenn später auf Next.js migriert
import Image from 'next/image';

export default function Hero() {
  return (
    <Image
      src="/hero-dashboard.webp"
      alt="DPP Dashboard für KI-Datenextraktion"
      width={1200}
      height={600}
      priority // 👈 LCP optimization
      sizes="(max-width: 768px) 100vw, 1200px"
    />
  );
}
```

---

## 3️⃣ IMAGE FORMAT OPTIMIZATION

### Konvertierung auf WebP + Fallback

```html
<picture>
  <!-- Modern browsers: WebP (20-35% smaller) -->
  <source 
    srcset="hero-dashboard.webp, hero-dashboard@2x.webp 2x" 
    type="image/webp"
  >
  <!-- Fallback: JPEG -->
  <img 
    src="hero-dashboard.jpg" 
    alt="DPP Dashboard"
    loading="eager"
    fetchpriority="high"
  />
</picture>
```

**Tools zum Konvertieren:**
```bash
# macOS/Linux with ImageMagick
convert hero-dashboard.jpg -quality 80 hero-dashboard.webp

# oder online: https://convertio.co/jpg-webp/
```

---

## 4️⃣ CSS/JS MINIFIKATION & BUNDLING

### Aktueller Status checken

```bash
# Dateigrößen prüfen
du -sh style.css 
du -sh *.html | sort -h
```

### Empfehlungen

**CSS Optimierungen:**
```bash
# 1. Unbenutzte CSS entfernen (PurgeCSS)
npm install --save-dev purgecss
purgecss --css style.css --content "*.html" --output style.min.css

# 2. Inline critical CSS (für Above-the-Fold)
# Hero-Section CSS inline in <head><style>...</style>
```

**JavaScript Optimierungen:**
```bash
# Alte Particles-Animation minimalisieren
# Die current bgCanvas animation: ~3KB ungeminifiziert
```

---

## 5️⃣ CACHING STRATEGY

### Cache Headers (Server Configuration)

```apache
# .htaccess (falls Apache)
<IfModule mod_expires.c>
  ExpiresActive On
  
  # Images: 1 Monat
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/webp "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
  
  # CSS/JS: 2 Wochen
  ExpiresByType text/css "access plus 2 weeks"
  ExpiresByType application/javascript "access plus 2 weeks"
  
  # HTML: 1 Tag (für Content Updates)
  ExpiresByType text/html "access plus 1 day"
</IfModule>
```

### Nginx Alternative

```nginx
location ~ \.(jpg|jpeg|png|gif|webp|svg|woff2|css|js)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location ~ \.html$ {
  expires 1d;
  add_header Cache-Control "public, max-age=86400";
}
```

---

## 6️⃣ GZIP COMPRESSION

### Enable Gzip

```apache
# .htaccess
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### Check ob aktiviert

```bash
curl -I -H "Accept-Encoding: gzip" https://dppflash.de
# Schaue nach: Content-Encoding: gzip
```

---

## 7️⃣ LIGHTHOUSE AUDIT CHECKLIST

### Durchführen Sie ein Audit

```bash
# In Chrome DevTools
1. DevTools öffnen (F12)
2. Lighthouse Tab
3. "Analyze page load"
```

### Zu überprüfende Punkte

- ✅ Performance Score > 90
- ✅ Accessibility Score > 95
- ✅ Best Practices Score > 90
- ✅ SEO Score > 95 (BESONDERS WICHTIG)
- ✅ Keine CLS shifts
- ✅ LCP < 2.5s

---

## 📋 IMPLEMENTATION PRIORITY

### Phase 1 (Diese Woche)
1. ☐ Font-Loading Strategy entscheiden (Google Fonts vs. System)
2. ☐ Lighthouse Audit durchführen
3. ☐ LCP-Element identifizieren (wahrscheinlich Hero Image)

### Phase 2 (Nächste Woche)
1. ☐ Hero-Image zu WebP konvertieren
2. ☐ Cache Headers einrichten
3. ☐ Gzip Compression aktivieren

### Phase 3 (2-3 Wochen)
1. ☐ CSS Minifikation + PurgeCSS
2. ☐ JavaScript Bundling (falls mehrere .js-Dateien)
3. ☐ Final Lighthouse Test

---

## 🎯 PERFORMANCE TARGETS

Nach Implementierung aller Optimierungen:

| Metrik | Ziel |
|--------|------|
| PageSpeed (Desktop) | > 85 |
| PageSpeed (Mobile) | > 75 |
| LCP | < 1.8s |
| FID | < 50ms |
| CLS | < 0.05 |
| Time to Interactive | < 3s |

---

## 🔗 TOOLS ZUM MESSEN

1. **Google PageSpeed Insights**: https://pagespeed.web.dev
2. **GTmetrix**: https://gtmetrix.com (detaillierte Berichte)
3. **WebPageTest**: https://www.webpagetest.org (Waterfall Charts)
4. **Chrome DevTools Lighthouse**: Built-in in Chrome
5. **Core Web Vitals Report**: Google Search Console

---

## 📝 NOTES

- **Keine Next.js Migration vorerst**: Diese Optimierungen sind für das aktuelle HTML+CSS-Setup
- **Clean Code**: Alle Änderungen folgen Best Practices ohne Komplexität zu erhöhen
- **Backwards Compatible**: Alle Optimierungen sind fallback-sicher

---

**Next Step:** Methode entscheiden → Implementieren → Messen → Iterieren
