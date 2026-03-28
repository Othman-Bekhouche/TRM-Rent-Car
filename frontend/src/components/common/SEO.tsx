import { Helmet } from 'react-helmet-async';
import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  canonical?: string;
  children?: React.ReactNode;
}

const SEO: React.FC<SEOProps> = ({
  title = "TRM Rent Car | Location de Voitures de Prestige au Maroc",
  description = "TRM Rent Car est votre partenaire de confiance pour la location de voitures de luxe au Maroc. Découvrez notre flotte d'exception pour vos besoins personnels ou professionnels.",
  keywords = "location voiture maroc, location voiture luxe maroc, car rental morocco, luxe car rent, TRM Rent Car, location voiture casablanca, location voiture marrakech",
  ogImage = "/trm-logo-pour-arriere-blanc.png",
  ogUrl = typeof window !== 'undefined' ? window.location.href : '',
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterSite = "@TRMRentCar",
  twitterCreator = "@TRMRentCar",
  canonical,
  children,
}) => {
  const siteUrl = "https://trmrentcar.com"; // Base URL for the site
  const fullTitle = title.includes("TRM Rent Car") ? title : `${title} | TRM Rent Car`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {canonical && <link rel="canonical" href={canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="TRM Rent Car" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />

      {/* Additional Tags (Robots, Geo, etc.) */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="French, Arabic, English" />
      <meta name="geo.region" content="MA" />
      <meta name="geo.placename" content="Casablanca" />

      {children}
    </Helmet>
  );
};

export default SEO;
