import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';

const sitemap = new SitemapStream({ hostname: 'https://vocabstream.vercel.app' });

sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
sitemap.write({ url: '/home', changefreq: 'monthly', priority: 0.8 });
sitemap.write({ url: '/learn', changefreq: 'monthly', priority: 0.8 });
sitemap.write({ url: '/review', changefreq: 'monthly', priority: 0.8 });
sitemap.write({ url: '/others', changefreq: 'monthly', priority: 0.8 });
sitemap.write({ url: '/privacy', changefreq: 'monthly', priority: 0.8 });
sitemap.write({ url: '/prompts', changefreq: 'monthly', priority: 0.8 });
sitemap.write({ url: '/still_under_development', changefreq: 'monthly', priority: 0.8 });
sitemap.write({ url: '/progress_transport', changefreq: 'monthly', priority: 0.6 });
sitemap.write({ url: '/learn/:genreId', changefreq: 'monthly', priority: 0.6 });
sitemap.write({ url: '/lesson/:lessonId', changefreq: 'monthly', priority: 0.6 });
sitemap.write({ url: '/review_paragraph_fillin', changefreq: 'monthly', priority: 0.6 });
sitemap.write({ url: '/review_three_choise_questions', changefreq: 'monthly', priority: 0.6 });
sitemap.write({ url: '/review_three_choise_questions', changefreq: 'monthly', priority: 0.6 });
sitemap.end();

streamToPromise(sitemap).then((data) => {
  createWriteStream('./public/sitemap.xml').write(data.toString());
});
