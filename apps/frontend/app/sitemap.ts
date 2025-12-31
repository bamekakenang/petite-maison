import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'http://localhost:3001';
  return [
    { url: `${base}/fr`, lastModified: new Date() },
    { url: `${base}/fr/produits`, lastModified: new Date() },
    { url: `${base}/fr/fanzine`, lastModified: new Date() },
    { url: `${base}/fr/contact`, lastModified: new Date() }
  ];
}
