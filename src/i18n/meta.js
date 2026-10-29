// Page titles and descriptions per language. Shared by the React app (client) and
// worker.js (server-side injection for search engines and link previews).

export const SITE_NAME = 'Balaji Construction Private Limited';

export const pageMeta = {
  en: {
    home: {
      title: 'Balaji Construction Private Limited — Construction company',
      description: 'Balaji Construction Private Limited: completed and ongoing construction projects with photos, area and details. Send an enquiry online.',
    },
    projects: {
      title: 'Projects | Balaji Construction Private Limited',
      description: 'Completed and ongoing projects by Balaji Construction Private Limited, with photos, built-up area, floors and timelines.',
    },
    services: {
      title: 'Services | Balaji Construction Private Limited',
      description: 'Construction services offered by Balaji Construction Private Limited and how a project works, from enquiry to handover.',
    },
    about: {
      title: 'About | Balaji Construction Private Limited',
      description: 'About Balaji Construction Private Limited, its projects and company details.',
    },
    contact: {
      title: 'Contact | Balaji Construction Private Limited',
      description: 'Send an enquiry to Balaji Construction Private Limited about your construction project.',
    },
    notFound: { title: 'Page not found | Balaji Construction Private Limited', description: 'This page does not exist.' },
    project: (p) => ({
      title: `${p.title} | Balaji Construction Private Limited`,
      description: [p.title, p.location, p.builtUpAreaSqft && `${p.builtUpAreaSqft} sq ft built-up`, 'Project by Balaji Construction Private Limited.']
        .filter(Boolean)
        .join(' · '),
    }),
  },
  hi: {
    home: {
      title: 'बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड — कंस्ट्रक्शन कंपनी',
      description: 'बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड: पूरे हुए और चल रहे निर्माण प्रोजेक्ट, फ़ोटो, क्षेत्रफल और जानकारी के साथ। ऑनलाइन पूछताछ भेजें।',
    },
    projects: {
      title: 'प्रोजेक्ट | बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड',
      description: 'बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड के पूरे हुए और चल रहे प्रोजेक्ट — फ़ोटो, निर्मित क्षेत्रफल, मंज़िलें और समय-सीमा।',
    },
    services: {
      title: 'सेवाएँ | बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड',
      description: 'बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड की निर्माण सेवाएँ और पूछताछ से हैंडओवर तक प्रोजेक्ट की प्रक्रिया।',
    },
    about: {
      title: 'हमारे बारे में | बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड',
      description: 'बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड, इसके प्रोजेक्ट और कंपनी की जानकारी।',
    },
    contact: {
      title: 'संपर्क | बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड',
      description: 'अपने निर्माण प्रोजेक्ट के बारे में बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड को पूछताछ भेजें।',
    },
    notFound: { title: 'पेज नहीं मिला | बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड', description: 'यह पेज मौजूद नहीं है।' },
    project: (p) => ({
      title: `${p.title} | बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड`,
      description: [p.title, p.location, p.builtUpAreaSqft && `${p.builtUpAreaSqft} वर्ग फ़ुट निर्मित क्षेत्र`, 'बालाजी कंस्ट्रक्शन प्राइवेट लिमिटेड का प्रोजेक्ट।']
        .filter(Boolean)
        .join(' · '),
    }),
  },
};

// Maps a path to { lang, page, slug, basePath } — basePath is the path without the /hi prefix.
export function parsePath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const lang = clean === '/hi' || clean.startsWith('/hi/') ? 'hi' : 'en';
  const base = lang === 'hi' ? clean.slice(3) || '/' : clean;
  let page = 'notFound';
  let slug;
  if (base === '/') page = 'home';
  else if (base === '/projects') page = 'projects';
  else if (base.startsWith('/projects/') && base.split('/').length === 3) {
    page = 'project';
    slug = decodeURIComponent(base.split('/')[2]);
  } else if (['/services', '/about', '/contact'].includes(base)) page = base.slice(1);
  return { lang, page, slug, basePath: base };
}

export const localize = (lang, basePath) => (lang === 'hi' ? (basePath === '/' ? '/hi' : `/hi${basePath}`) : basePath);

export const STATIC_PAGES = ['/', '/projects', '/services', '/about', '/contact'];
