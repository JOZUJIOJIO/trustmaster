# Kairos Page Artwork Design

## Goal

Give the main Kairos pages a cohesive visual system with stronger beauty and mystery, using ChatGPT Image-generated artwork as page-specific atmospheric illustrations.

## Direction

The artwork system extends the current Sanxingdui bronze homepage direction. Each page gets a distinct symbolic image, but all images share the same world: blackened bronze, muted gold, jade green, celestial rings, mist, ritual objects, sacred tree forms, and subtle grain.

## Pages

- Fortune: bronze BaZi divination chart with mask silhouette.
- Compatibility: paired jade tokens connected by celestial lines.
- Daily: dawn star wheel over ancient mountains.
- Health: abstract five-elements body and meridian light.
- Learn: ancient study table with scrolls and compass.
- Profile: private archive of jade tablets and saved readings.
- Login: bronze-jade sanctuary gate.
- About: sacred bronze tree origin scene.

## Implementation

Save final assets under `public/images/kairos/` as compressed WebP files. Add a small page artwork registry and a reusable visual band component so pages can opt into artwork without duplicating paths or image treatment.

## Constraints

- Generated artwork must contain no readable text, no logos, and no modern UI.
- Existing page workflows stay intact.
- Page copy remains readable on mobile and desktop.
- Homepage keeps the real Sanxingdui bronze image treatment already in place.
