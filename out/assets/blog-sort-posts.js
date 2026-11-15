"use strict";

/** Sort blog hub lists by German display date (newest first). */
(function () {
  const MONTHS = {
    januar: 0,
    februar: 1,
    märz: 2,
    maerz: 2,
    april: 3,
    mai: 4,
    juni: 5,
    juli: 6,
    august: 7,
    september: 8,
    oktober: 9,
    november: 10,
    dezember: 11,
  };

  function parseGermanDate(text) {
    const m = String(text).match(/(\d{1,2})\.\s*([A-Za-zäöüÄÖÜß]+)\s*(\d{4})/);
    if (!m) return 0;
    const monthKey = m[2].toLowerCase();
    const month = MONTHS[monthKey];
    if (month === undefined) return 0;
    return Date.UTC(Number(m[3]), month, Number(m[1]));
  }

  function dateFromArticle(el) {
    const meta = el.querySelector(".blog-article-meta");
    if (meta) return parseGermanDate(meta.textContent);
    for (const p of el.querySelectorAll("p")) {
      const ts = parseGermanDate(p.textContent);
      if (ts) return ts;
    }
    return 0;
  }

  function sortContainer(container, itemSelector) {
    const items = [...container.querySelectorAll(itemSelector)];
    if (items.length < 2) return;
    items.sort((a, b) => dateFromArticle(b) - dateFromArticle(a));
    const frag = document.createDocumentFragment();
    items.forEach((el) => frag.appendChild(el));
    container.appendChild(frag);
  }

  function init() {
    document
      .querySelectorAll(".post-list")
      .forEach((list) => sortContainer(list, ":scope > article"));
    document
      .querySelectorAll(".blog-articles")
      .forEach((list) =>
        sortContainer(list, ":scope > .blog-article-item, :scope > article"),
      );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();