# Partnerseite — Launch- & Verzeichnis-Badges

Einbindbare Badges für die [Partnerseite](../partner/index.html) bzw. ähnliche Landing-Bereiche. Links öffnen in einem neuen Tab; Bilder stammen von den jeweiligen Anbietern.

**Live-Vorschau:** [dppflash.de/docs/](https://dppflash.de/docs/)

## Fazier (Featured)

```html
<a
  href="https://fazier.com/launches/dppflash.de"
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=dark"
    width="250"
    alt="Fazier badge"
  />
</a>
```

## TinyLaunch

```html
<a href="https://tinylaunch.com" target="_blank" rel="noopener noreferrer">
  <img
    src="https://tinylaunch.com/tinylaunch_badge_1.svg"
    alt="TinyLaunch Badge"
    style="width: 202px; height: auto;"
  />
</a>
```

## StartupBase (Featured, Dark)

```html
<a
  href="https://startupbase.io/products/dpp-flash?utm_source=startupbase&utm_medium=badge&utm_campaign=featured-badge-dark"
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src="https://statics.startupbase.io/site/badges/featured-on-sb-dark.svg"
    alt="Featured on StartupBase"
    height="55"
    style="height: 55px; width: auto;"
  />
</a>
```

## LaunchNest (Featured)

```html
<a
  href="https://launchnest.io/p/dpp-l-sung-f-r-kmu-digitaler-produktpass-einfach-erstellen"
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src="https://launchnest.io/badge/dpp-l-sung-f-r-kmu-digitaler-produktpass-einfach-erstellen.svg?variant=featured"
    alt="DPP Lösung für KMU on LaunchNest"
    width="220"
    height="56"
  />
</a>
```

## Nick Launches (Featured, Dark)

```html
<a
  href="https://nicklaunches.com/products/dpp-flash/"
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src="https://nicklaunches.com/badges/featured-dark.png"
    alt="DPP-Flash on Nick Launches"
    width="244"
    height="56"
  />
</a>
```

## Alle Badges in einer Reihe (Beispiel)

Für eine horizontale Anordnung z. B. ein flex-Container um die obigen Blöcke:

```html
<div
  style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.25rem;"
>
  <!-- jeweils einen der obigen <a>…</a>-Blöcke einfügen -->
</div>
```

Bei Einbindung in die Live-Seite `height`/`width` der Bilder nicht verkleinern, falls die Richtlinien der Anbieter feste Abmessungen vorschreiben.
