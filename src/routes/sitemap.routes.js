const { Router } = require('express');
const pool = require('../lib/db');

const router = Router();

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://neelassarees.com';

function formatDate(dateValue) {
  try {
    const d = dateValue ? new Date(dateValue) : new Date();
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.get('/sitemap.xml', async (_req, res) => {
  try {
    const today = formatDate();

    // 1. Core static pages
    const staticUrls = [
      { loc: `${SITE_URL}/`, lastmod: today, changefreq: 'daily', priority: '1.0' },
      { loc: `${SITE_URL}/collections`, lastmod: today, changefreq: 'daily', priority: '0.9' },
      { loc: `${SITE_URL}/collections/cotton-sarees`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
      { loc: `${SITE_URL}/collections/mul-mul-cotton-sarees`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
      { loc: `${SITE_URL}/collections/daily-wear`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
      { loc: `${SITE_URL}/collections/festive-wear`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
      { loc: `${SITE_URL}/contact`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
      { loc: `${SITE_URL}/track-order`, lastmod: today, changefreq: 'monthly', priority: '0.6' },
      { loc: `${SITE_URL}/policies/shipping`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
      { loc: `${SITE_URL}/policies/returns`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
      { loc: `${SITE_URL}/policies/privacy`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
      { loc: `${SITE_URL}/policies/terms`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
      { loc: `${SITE_URL}/policies/cookies`, lastmod: today, changefreq: 'monthly', priority: '0.4' },
    ];

    // 2. Fetch active categories from database
    let categoryUrls = [];
    try {
      const [categories] = await pool.query(
        'SELECT slug, updatedAt FROM categories WHERE isActive = 1 ORDER BY sortOrder ASC'
      );
      categoryUrls = categories
        .filter(c => c.slug)
        .map(c => ({
          loc: `${SITE_URL}/collections/${encodeURIComponent(c.slug)}`,
          lastmod: formatDate(c.updatedAt),
          changefreq: 'weekly',
          priority: '0.8',
        }));
    } catch {
      categoryUrls = [];
    }

    // 3. Fetch all active products from database
    let productUrls = [];
    try {
      const [products] = await pool.query(
        'SELECT slug, updatedAt FROM products WHERE isActive = 1 ORDER BY updatedAt DESC'
      );
      productUrls = products
        .filter(p => p.slug)
        .map(p => ({
          loc: `${SITE_URL}/products/${encodeURIComponent(p.slug)}`,
          lastmod: formatDate(p.updatedAt),
          changefreq: 'weekly',
          priority: '0.8',
        }));
    } catch {
      productUrls = [];
    }

    // Combine all URLs (avoiding duplicates)
    const seen = new Set();
    const allUrls = [...staticUrls, ...categoryUrls, ...productUrls].filter(item => {
      if (seen.has(item.loc)) return false;
      seen.add(item.loc);
      return true;
    });

    // Build XML string
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    return res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
