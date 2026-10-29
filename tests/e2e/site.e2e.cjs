// Full website E2E: both languages, three viewports, link crawl, enquiry, keyboard, axe, admin.
// Run against local Workers (see README → Testing):  BASE=http://127.0.0.1:8790 npm run test:e2e
// Needs balaji-api/.dev.vars with ADMIN_EMAIL=owner@example.com and ADMIN_PASSWORD=correct-horse,
// and a fresh local database. Cloudinary photos are replaced with local fixtures.
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const fs = require('fs');

const B = process.env.BASE || 'http://127.0.0.1:8790';
const path = require('path');
const SHOTS = process.env.SHOTS || path.join(__dirname, 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (ok, name, detail = '') => {
  results.push({ ok, name, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${detail ? ` (${detail})` : ''}`);
};
const fake = [0, 1, 2, 3].map((i) => fs.readFileSync(path.join(__dirname, 'fixtures', `photo${i}.jpg`)));

async function apiCall(path, method = 'GET', body, cookie) {
  const res = await fetch(B + '/api' + path, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie && { cookie }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, headers: res.headers, body: res.status === 204 ? null : await res.json() };
}

const img = (n) => ({ url: `https://res.cloudinary.com/nmqoi2zl/image/upload/v1/balaji/projects/p${n}.jpg`, publicId: `balaji/projects/p${n}`, width: 1600, height: 1200 });

async function seed() {
  const login = await apiCall('/auth/login', 'POST', { email: 'owner@example.com', password: 'correct-horse' });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const { body: existing } = await apiCall('/admin/projects', 'GET', undefined, cookie);
  if (!existing.items.length) {
    await apiCall('/admin/projects', 'POST', { title: 'Red Villa , Duplex Villa', category: 'residential', status: 'completed', location: 'Haldwani', coverImage: img(0), gallery: [img(1), img(2), img(3)], plotAreaSqft: 3000, builtUpAreaSqft: 2000, floors: 2, cost: { amountInr: 12000000 }, startDate: '2023-01', completionDate: '2024-08', published: true, featured: true }, cookie);
    await apiCall('/admin/projects', 'POST', { title: 'Abhilasa, Duplex Villa, Har Shayam Vihar Phase I', category: 'residential', status: 'completed', location: 'Choti Mukhani, Haldwani', coverImage: img(1), gallery: [img(2), img(3), img(0)], plotAreaSqft: 1678, builtUpAreaSqft: 1550, floors: 2, startDate: '2024-02', completionDate: '2025-05', published: true, featured: true }, cookie);
  }
  return cookie;
}

const PAGES = ['/', '/projects', '/projects/red-villa-duplex-villa', '/services', '/about', '/contact'];
const VIEWPORTS = { mobile: { width: 375, height: 812 }, tablet: { width: 820, height: 1180 }, desktop: { width: 1366, height: 900 } };
const EN_UI = ['Send an enquiry', 'View projects', 'Frequently asked questions', 'How a project works', 'Project details', 'Our projects', 'Pages', 'Contact', 'Services'];

async function newPage(browser, vp) {
  const ctx = await browser.newContext({ viewport: VIEWPORTS[vp] });
  await ctx.route('https://res.cloudinary.com/**', (r) => {
    const n = Number(r.request().url().match(/p(\d)\.jpg/)?.[1] || 0);
    r.fulfill({ status: 200, contentType: 'image/jpeg', body: fake[n % 4] });
  });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/ERR_TUNNEL|net::ERR|fbevents/.test(m.text()) && page.errors.push(m.text()));
  return page;
}

(async () => {
  const cookie = await seed();
  const browser = await chromium.launch();

  // ---------- 1. Every page × language × viewport: renders, no raw keys, no placeholders, screenshots ----------
  for (const vp of Object.keys(VIEWPORTS)) {
    const page = await newPage(browser, vp);
    for (const lang of ['en', 'hi']) {
      for (const p of PAGES) {
        const url = (lang === 'hi' ? (p === '/' ? '/hi' : '/hi' + p) : p);
        await page.goto(B + url, { waitUntil: 'networkidle' });
        const text = await page.locator('body').innerText();
        const htmlLang = await page.getAttribute('html', 'lang');
        const title = await page.title();
        const rawKeys = text.match(/\b(nav|cta|hero|projects|facts|services|process|faq|contact|footer|about|status|categories)\.[a-zA-Z]+/g);
        const placeholders = /0000000000|example\.com|undefined|NaN|\[object Object\]/.test(text);
        const enLeft = lang === 'hi' ? EN_UI.filter((s) => text.includes(s)) : [];
        const ok = htmlLang === lang && !rawKeys && !placeholders && enLeft.length === 0 && (lang === 'en' ? title.includes('Balaji Construction Private Limited') : title.includes('बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड'));
        check(ok, `[${vp}] ${url} renders in ${lang}`, [!ok && `lang=${htmlLang}`, rawKeys && `raw keys ${rawKeys}`, placeholders && 'placeholder text', enLeft.length && `English left: ${enLeft}`].filter(Boolean).join('; '));
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        check(overflow <= 1, `[${vp}] ${url} has no horizontal overflow`, overflow > 1 ? `${overflow}px` : '');
        if (vp !== 'tablet' || p === '/') {
          const name = `${vp}_${lang}${p === '/' ? '_home' : p.replace(/\//g, '_')}`.replace('_projects_red-villa-duplex-villa', '_project');
          await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
        }
      }
    }
    check(page.errors.length === 0, `[${vp}] no page/console errors`, page.errors.slice(0, 3).join(' | '));
    await page.context().close();
  }

  // ---------- 2. Link crawl: every internal link resolves, every button is named ----------
  {
    const page = await newPage(browser, 'desktop');
    const seen = new Set();
    const queue = ['/', '/hi'];
    const broken = [];
    let unnamed = [];
    while (queue.length) {
      const u = queue.shift();
      if (seen.has(u)) continue;
      seen.add(u);
      const res = await page.goto(B + u, { waitUntil: 'networkidle' });
      const is404 = (await page.locator('h1').first().innerText()).match(/Page not found|पेज नहीं मिला/);
      if (!res || res.status() >= 400 || is404) broken.push(`${u} → ${res?.status()}`);
      const links = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
      for (const h of links) {
        if (h.startsWith('/') && !h.startsWith('/admin') && !seen.has(h.split('#')[0])) queue.push(h.split('#')[0]);
        if (h === '#' || h === '' || h.startsWith('javascript')) broken.push(`dead href on ${u}`);
      }
      const names = await page.$$eval('button, a[href]', (els) => els.filter((e) => e.offsetParent !== null && !(e.innerText.trim() || e.getAttribute('aria-label'))).map((e) => e.outerHTML.slice(0, 80)));
      unnamed = unnamed.concat(names);
    }
    check(broken.length === 0, `link crawl: ${seen.size} internal pages, no broken links`, broken.join(', '));
    check(unnamed.length === 0, 'every visible button/link has an accessible name', unnamed.slice(0, 3).join(' | '));
    const sm = await (await fetch(B + '/sitemap.xml')).text();
    check(sm.includes('/hi/projects/red-villa-duplex-villa') && (sm.match(/<url>/g) || []).length === 14, 'sitemap lists 7 pages × 2 languages with hreflang', `${(sm.match(/<url>/g) || []).length} urls`);
    await page.context().close();
  }

  // ---------- 3. Server-side SEO per language ----------
  for (const [u, lang, needle] of [['/projects/red-villa-duplex-villa', 'en', 'Red Villa'], ['/hi/projects/red-villa-duplex-villa', 'hi', 'बालाजी']]) {
    const html = await (await fetch(B + u)).text();
    const ok = html.includes(`<html lang="${lang}"`) && /<title>[^<]*Red Villa/.test(html) && html.includes(needle) && html.includes('hreflang="hi"') && html.includes('"GeneralContractor"') && html.includes('og:image') && html.includes('rel="canonical"');
    check(ok, `server HTML for ${u} has lang, title, canonical, hreflang, OG image, JSON-LD`);
  }
  {
    const r = await fetch(B + '/projects/does-not-exist');
    check(r.status === 404 && (await r.text()).includes('noindex'), 'unknown project returns 404 + noindex');
  }

  // ---------- 4. Interactions: menu, language switch, filters, FAQ, lightbox keyboard ----------
  {
    const page = await newPage(browser, 'mobile');
    await page.goto(B + '/projects');
    await page.click('button[aria-label="Open menu"]');
    check(await page.locator('#mobile-menu').isVisible(), 'mobile menu opens');
    await page.keyboard.press('Escape');
    check(!(await page.locator('#mobile-menu').count()), 'Escape closes mobile menu');
    await page.click('button[aria-label="Open menu"]');
    await page.click('#mobile-menu >> text=Services');
    await page.waitForURL(/\/services$/);
    await page.waitForSelector('h1:has-text("What we build")');
    check(!(await page.locator('#mobile-menu').count()), 'menu link navigates and closes menu');
    await page.click('header a[hreflang="hi"]');
    await page.waitForURL(/\/hi\/services$/);
    await page.waitForSelector('h1:has-text("हम क्या बनाते हैं")');
    check((await page.getAttribute('html', 'lang')) === 'hi' && (await page.locator('h1').innerText()).includes('हम क्या बनाते हैं'), 'language switch keeps the same page (/services → /hi/services)');
    await page.click('header a[hreflang="en"]');
    await page.waitForURL(/\/services$/);
    await page.waitForSelector('h1:has-text("What we build")');
    check((await page.getAttribute('html', 'lang')) === 'en', 'switch back to English');

    // FAQ via keyboard
    await page.goto(B + '/hi');
    const q2 = page.locator('#faq-q-1');
    await q2.focus();
    await page.keyboard.press('Enter');
    check((await q2.getAttribute('aria-expanded')) === 'true' && (await page.locator('#faq-a-1').isVisible()), 'FAQ opens with keyboard (Hindi)');

    // Lightbox keyboard + focus return
    await page.goto(B + '/projects/red-villa-duplex-villa');
    await page.waitForSelector('[data-photo="0"]');
    const first = page.locator('[data-photo="0"]');
    await first.focus();
    await page.keyboard.press('Enter');
    const dlg = page.locator('role=dialog');
    check(await dlg.isVisible(), 'photo viewer opens with keyboard');
    await page.keyboard.press('ArrowRight');
    check((await page.locator('role=dialog >> p').innerText()).includes('2 of 4'), 'ArrowRight shows next photo', await page.locator('role=dialog >> p').innerText());
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
    check(await page.evaluate(() => !!document.activeElement.closest('[role=dialog]')), 'focus stays inside photo viewer');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    check(!(await dlg.count()) && (await page.evaluate(() => document.activeElement.dataset.photo)) === '1', 'Escape closes viewer and returns focus to a photo');
    const facts = await page.$$eval('dl dt', (d) => d.map((x) => x.innerText));
    check(JSON.stringify(facts) === JSON.stringify(['Status', 'Location', 'Plot area', 'Built-up area', 'Floors', 'Cost', 'Started', 'Completed']), 'project shows the filled facts', facts.join(', '));
    check((await page.locator('dd', { hasText: '₹1.2 crore' }).count()) === 1, 'cost formatted in crore');
    await page.goto(B + '/hi/projects/abhilasa-duplex-villa-har-shayam-vihar-phase-i');
    await page.waitForSelector('dl dt');
    const hiFacts = await page.$$eval('dl dt', (d) => d.map((x) => x.innerText));
    check(!hiFacts.includes('लागत') && hiFacts.includes('प्लॉट क्षेत्रफल'), 'Hindi project hides empty cost, labels in Hindi', hiFacts.join(', '));

    // Skip link
    await page.goto(B + '/');
    await page.keyboard.press('Tab');
    check((await page.evaluate(() => document.activeElement.textContent)).includes('Skip to main content'), 'skip link is first in tab order');
    await page.context().close();
  }

  // ---------- 5. Enquiry flow, both languages ----------
  for (const lang of ['en', 'hi']) {
    const page = await newPage(browser, 'mobile');
    await page.goto(B + (lang === 'hi' ? '/hi/contact' : '/contact'));
    await page.click('button[type=submit]');
    const nameErr = await page.locator('#name-error').innerText();
    const phoneErr = await page.locator('#phone-error').innerText();
    check(lang === 'en' ? nameErr.includes('Please enter your name') && phoneErr.includes('10-digit') : nameErr.includes('कृपया अपना नाम') && phoneErr.includes('10 अंकों'), `[${lang}] empty form shows localized errors`, `${nameErr} / ${phoneErr}`);
    check(await page.evaluate(() => document.activeElement.id === 'field-name'), `[${lang}] focus moves to first invalid field`);
    check((await page.getAttribute('#field-phone', 'aria-invalid')) === 'true', `[${lang}] invalid field marked aria-invalid`);
    const typeOptions = await page.$$eval('select option', (o) => o.map((x) => x.textContent));
    check(lang === 'hi' ? typeOptions.includes('नया मकान') : typeOptions.includes('New house'), `[${lang}] dropdown options translated`, typeOptions.slice(0, 3).join(', '));
    await page.fill('#field-name', lang === 'hi' ? 'रवि जोशी' : 'Ravi Joshi');
    await page.fill('#field-phone', '+91 98123 45678');
    await page.fill('#field-email', 'not-an-email');
    await page.click('button[type=submit]');
    check((await page.locator('#email-error').innerText()).length > 0, `[${lang}] bad email flagged`);
    await page.fill('#field-email', '');
    await page.selectOption('select', 'New house');
    await page.fill('textarea', lang === 'hi' ? 'मुझे 2BHK मकान बनवाना है।' : 'Need a 2BHK house.');
    await page.click('button[type=submit]');
    await page.waitForSelector('[role=status]');
    const done = await page.locator('[role=status]').innerText();
    check(lang === 'en' ? done.includes('Balaji Construction Private Limited') : done.includes('बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड'), `[${lang}] success message names the company`, done.split('\n')[0]);
    await page.screenshot({ path: `${SHOTS}/mobile_${lang}_contact_sent.png` });
    await page.context().close();
  }
  {
    const inbox = await apiCall('/admin/enquiries', 'GET', undefined, cookie);
    const hi = inbox.body.items.find((e) => e.name === 'रवि जोशी');
    const en = inbox.body.items.find((e) => e.name === 'Ravi Joshi');
    check(hi && en && hi.phone === '9812345678' && hi.lang === 'hi' && en.projectType === 'New house', 'both enquiries stored with phone normalised and language recorded');
  }

  // ---------- 6. With verified contact details saved: call / WhatsApp / social / JSON-LD ----------
  {
    await apiCall('/admin/settings', 'PUT', { phone: '+91 98765 43210', whatsapp: '9876543210', email: 'test@balaji.test', address: 'Test address', social: { instagram: 'https://instagram.com/test' }, services: ['residential', 'interior'], aboutEn: 'Owner-written about text.', aboutHi: 'मालिक द्वारा लिखा गया परिचय।', stats: [{ label: 'Projects completed', value: '2' }] }, cookie);
    const page = await newPage(browser, 'mobile');
    await page.goto(B + '/hi', { waitUntil: 'networkidle' });
    const wa = await page.getAttribute('a[aria-label="व्हाट्सऐप पर बात करें"]', 'href');
    check(wa.startsWith('https://wa.me/919876543210?text=') && decodeURIComponent(wa).includes('बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड'), 'WhatsApp button uses saved number and Hindi message with company name');
    const tel = await page.getAttribute('a[aria-label="हमें कॉल करें"]', 'href');
    check(tel === 'tel:+919876543210', 'call button uses saved number', tel);
    check((await page.locator('footer a[aria-label="इंस्टाग्राम"]').count()) === 1 && (await page.locator('footer a[aria-label="फ़ेसबुक"]').count()) === 0, 'footer shows only saved social links');
    check((await page.locator('text=2').first().count()) === 1 && (await page.locator('section[aria-label="एक नज़र में"]').count()) === 1, 'stats strip appears only once stats are saved');
    await page.goto(B + '/hi/about', { waitUntil: 'networkidle' });
    check((await page.locator('text=मालिक द्वारा लिखा गया परिचय।').count()) === 1, 'About shows owner Hindi text');
    await page.goto(B + '/services');
    await page.waitForSelector('#services-list h3');
    const svc = await page.$$eval('#services-list h3', (h) => h.map((x) => x.innerText));
    check(JSON.stringify(svc) === JSON.stringify(['Residential construction', 'Interior work']), 'services follow the owner’s ticked list', svc.join(', '));
    const html = await (await fetch(B + '/')).text();
    check(html.includes('"telephone":"+91 98765 43210"') && html.includes('"sameAs":["https://instagram.com/test"]'), 'JSON-LD includes saved phone and social profile');
    await page.screenshot({ path: `${SHOTS}/mobile_hi_services_with_settings.png`, fullPage: false });
    // reset to production-like empty settings
    await apiCall('/admin/settings', 'PUT', {}, cookie);
    await page.goto(B + '/', { waitUntil: 'networkidle' });
    check((await page.locator('a[href^="tel:"], a[href*="wa.me"]').count()) === 0, 'with no saved numbers, no call/WhatsApp links are shown (no fake contacts)');
    check(await page.locator('main a:has-text("Send an enquiry")').first().isVisible(), 'enquiry CTA always available on mobile');
    await page.context().close();
  }

  // ---------- 7. Accessibility scan (axe, WCAG 2 AA) ----------
  for (const lang of ['en', 'hi']) {
    for (const vp of ['mobile', 'desktop']) {
      const page = await newPage(browser, vp);
      const issues = [];
      for (const p of PAGES) {
        await page.goto(B + (lang === 'hi' ? (p === '/' ? '/hi' : '/hi' + p) : p), { waitUntil: 'networkidle' });
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        for (const v of r.violations) issues.push(`${p}: ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target}`);
      }
      check(issues.length === 0, `axe WCAG 2.1 AA: ${lang} ${vp}, 6 pages`, issues.slice(0, 4).join(' | '));
      await page.context().close();
    }
  }

  // ---------- 8. Admin regression ----------
  {
    const page = await newPage(browser, 'desktop');
    await page.goto(B + '/admin');
    await page.fill('input[type=email]', 'owner@example.com');
    await page.fill('input[type=password]', 'correct-horse');
    await page.click('button:has-text("Log in")');
    await page.waitForSelector('text=Red Villa');
    for (const tab of ['Enquiries', 'Reviews', 'Social media', 'Settings', 'Projects']) {
      await page.click(`nav[aria-label=Admin] >> text=${tab}`);
      await page.waitForURL(new RegExp(`/admin/${tab === 'Social media' ? 'social' : tab.toLowerCase()}`));
    }
    check(true, 'admin login and all five tabs open');
    await page.click('nav[aria-label=Admin] >> text=Settings');
    await page.getByLabel('Modular kitchens').check();
    await page.fill('textarea >> nth=0', 'About from admin.');
    await page.click('button:has-text("Save settings")');
    await page.waitForSelector('text=Saved. The website is updated.');
    const s = await apiCall('/settings');
    check(s.body.services?.includes('kitchen') && s.body.aboutEn === 'About from admin.', 'admin saves services and About text');
    await page.screenshot({ path: `${SHOTS}/desktop_admin_settings.png`, fullPage: true });
    const realErrors = page.errors.filter((e) => !/401 \(Unauthorized\)/.test(e));
    check(realErrors.length === 0, 'admin has no page errors (pre-login 401 session check is expected)', realErrors.join(' | '));
    await apiCall('/admin/settings', 'PUT', {}, cookie);
    await page.context().close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify(results, null, 2));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('CRASH', e.message.split('\n')[0]);
  process.exit(2);
});
