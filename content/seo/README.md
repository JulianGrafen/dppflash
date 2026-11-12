# Programmatic SEO (pSEO) — DPP-Flash Blog

Nächtlicher Lauf: **10 neue deutsche B2B-Artikel** als ein PR.

## Dateilayout

| Pfad | Zweck |
|------|--------|
| `content/seo/keyword_matrix.json` | 106 Keywords mit `status`: `planned` / `draft` / `published`, `publish_order`, `night`, `next_article_slug` / `prev_article_slug` |
| `content/seo/master-prompt.md` | Prompt inkl. Rechtskorrekturen für KI-Autoren |
| `content/blog/<slug>.json` | Artikeldaten (Quelle der Wahrheit) |
| `blog/<slug>/index.html` | Generierte statische Seite (nicht von Hand editieren) |
| `scripts/build-pseo-blog.mjs` | Renderer (Markdown → HTML, Sitemap, Blog-Liste) |
| `scripts/check-pseo-articles.mjs` | Qualitätsgate |

URLs: `https://dppflash.de/blog/<slug>/`

## Nightly Run (10 Artikel)

1. **Zeilen wählen:** In `keyword_matrix.json` die nächsten **10** Einträge mit `"status": "planned"` nach `publish_order` (bzw. `night` + Batch-Reihenfolge).
2. **Schreiben:** Pro Zeile ein JSON nach `master-prompt.md` anlegen unter `content/blog/<url_slug>.json`. Matrix-Felder als Kontext nutzen.
3. **Prüfen:** `npm run check:pseo` (Meta-Längen, Wortzahl 900–1.300, Tabelle, verbotene Phrasen, keine kaputten `/blog/`-Links, keine Duplikate).
4. **Bauen:** `npm run build:pseo` (HTML + `sitemap.xml` + Abschnitt auf `/blog/`).
5. **Matrix:** `status` der 10 Zeilen auf `"published"` setzen.
6. **PR:** Ein PR, Titel `pSEO: 10 neue DPP-Artikel (YYYY-MM-DD)`.

## Lokale Befehle

```bash
npm run check:pseo
npm run build:pseo
```

`build:pseo` führt danach `inject:ld-json` aus, damit der siteweite Schema-Bundle in neuen Seiten landet.

## Verwandte Artikel (Build-Logik)

Am Seitenende verlinkt das Build-Skript:

1. `next_article_slug`, falls dafür bereits `content/blog/<slug>.json` existiert
2. sonst `prev_article_slug`, falls vorhanden
3. sonst Anker `/blog/#compliance-ratgeber`

Niemals ein Ziel, für das noch keine Seite existiert.

## CI

Workflow `.github/workflows/pseo-quality.yml` — `npm run check:pseo` auf Pull Requests.
