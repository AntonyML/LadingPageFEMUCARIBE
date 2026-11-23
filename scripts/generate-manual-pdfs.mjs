import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const rawBaseUrl = process.argv[2] || 'http://127.0.0.1:4321';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

const guides = [
  {
    route: 'manual-de-usuario/visitante',
    output: 'public/documents/manual-visitante-femucaribe.pdf',
  },
  {
    route: 'manual-de-usuario/administrador',
    output: 'public/documents/manual-administrador-femucaribe.pdf',
  },
];

const footerTemplate = `
  <div style="width:100%;font-size:8px;color:#475569;padding:0 15mm;display:flex;justify-content:space-between;align-items:center;font-family:system-ui,-apple-system,sans-serif;">
    <span>FEMUCARIBE — Manual de usuario</span>
    <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
  </div>
`;

const browser = await chromium.launch();

try {
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();

  for (const guide of guides) {
    const targetUrl = `${baseUrl}/${guide.route}`;
    const outputPath = path.resolve(guide.output);
    mkdirSync(path.dirname(outputPath), { recursive: true });

    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => document.fonts.ready);

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '18mm',
        bottom: '18mm',
        left: '15mm',
        right: '15mm',
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate,
    });

    console.log(`Generated ${guide.output} from ${targetUrl}`);
  }
} finally {
  await browser.close();
}
