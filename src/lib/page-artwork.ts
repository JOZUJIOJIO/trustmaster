type PageArtwork = {
  src: string;
  alt: string;
  objectPosition?: string;
};

export const pageArtwork = {
  fortune: {
    src: "/images/kairos/fortune-hero.webp",
    alt: "Bronze Four Pillars map in a dark ritual chamber",
  },
  compatibility: {
    src: "/images/kairos/compatibility-hero.webp",
    alt: "Paired carved jade tokens connected by celestial rings",
  },
  daily: {
    src: "/images/kairos/daily-hero.webp",
    alt: "Dawn celestial wheel above ancient misty mountains",
    objectPosition: "50% 38%",
  },
  health: {
    src: "/images/kairos/health-hero.webp",
    alt: "Abstract five-elements energy body with meridian light",
  },
  learn: {
    src: "/images/kairos/learn-hero.webp",
    alt: "Ancient study table with scrolls, compass, bronze and jade tools",
  },
  profile: {
    src: "/images/kairos/profile-hero.webp",
    alt: "Private bronze archive with jade reading tablets and medallions",
  },
  login: {
    src: "/images/kairos/login-hero.webp",
    alt: "Bronze and jade sanctuary gate opening into warm ritual light",
  },
  about: {
    src: "/images/kairos/about-hero.webp",
    alt: "Sacred bronze tree rising from a celestial platform in mist",
  },
} as const satisfies Record<string, PageArtwork>;

export type PageArtworkKey = keyof typeof pageArtwork;
