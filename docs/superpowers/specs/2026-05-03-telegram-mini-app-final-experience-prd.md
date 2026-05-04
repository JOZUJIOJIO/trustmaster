# Kairos Telegram Mini App Final Experience PRD

## 1. Product Positioning

Kairos Telegram Mini App is a native-feeling personal rhythm companion inside Telegram. It uses AI-powered Eastern insight, Five Elements language, and bronze-culture visual identity to help users understand today's rhythm, generate a personal map, unlock deeper reports with Telegram Stars, and share a polished insight card with friends.

The product must feel like a finished consumer app, not a strategy demo. Users should never see internal planning terms such as growth loop, affiliate, managed bots, conversion funnel, PRD, or preview.

## 2. Product Goal

Build a complete local Mini App experience across four core pages:

- `/tg`: entry home that gives users a clear first action.
- `/daily`: free daily rhythm experience that creates trust and leads to Stars unlock.
- `/fortune`: main personal map and paid deep insight path.
- `/profile`: user's Telegram identity, Stars access, saved benefits, and invite link.

The local version must be testable without production deployment. It should preserve the existing web experience and only make Telegram-oriented improvements that also look acceptable on normal mobile web.

## 3. Target Users

Primary users:

- Telegram users who want a lightweight personal insight ritual.
- Users interested in Eastern culture, Five Elements, self-reflection, daily rhythm, and AI guidance.
- Existing Kairos users entering from shared cards or bot links.

Secondary users:

- Creators and channel owners who may later distribute Kairos through invite links.
- Returning users who want saved reports and daily reminders.

## 4. User Journey

1. User opens Kairos inside Telegram.
2. `/tg` shows a mysterious but clear first screen: "打开今天的节奏".
3. User taps "查看今日节奏" and enters `/daily`.
4. User enters birth date or uses a saved date to generate a daily rhythm card.
5. `/daily` shows score, do/don't guidance, daily insight, and a share action.
6. User sees a Stars unlock card for deeper daily analysis.
7. User taps "生成我的图谱" or "完整图谱分析" and enters `/fortune`.
8. User generates a personal map with minimal input friction.
9. User sees a paywall with Stars pricing in Telegram and USD on web.
10. User opens `/profile` to see identity, Stars access, invite link, saved report benefits, and logout.

## 5. Page Requirements

### `/tg` Entry Home

The page must:

- Use bronze mask and bronze tree background assets.
- Present a strong H1: "打开今天的节奏".
- Show one daily signal card with today's keyword, action direction, and energy cue.
- Offer two clear entry actions: daily rhythm and personal map.
- Show Stars access with 29, 99, and 399 Star products.
- End with a simple ritual section and a primary CTA.
- Avoid internal business vocabulary.

### `/daily` Daily Rhythm

The page must:

- Work as the free trust-building experience.
- Let users generate with birth date only.
- Store the birth date locally for returning users.
- Show daily score, four dimension bars, do/don't guidance, reference color/direction/number, and a daily insight paragraph.
- Add a share action for the daily card using native share when available, with clipboard fallback.
- Show a Stars unlock card for deeper daily analysis in Telegram and a web-safe Pro CTA outside Telegram.
- Keep text contrast strong in dark bronze theme.

### `/fortune` Personal Map

The page must:

- Keep minimal friction for Mini App users: birth date is required; hour and gender can default.
- Present the personal map as the main paid conversion path.
- Use Stars pricing inside Telegram and USD outside Telegram.
- Make paywall copy practical and safe: insight, structure, communication, rhythm, action suggestions.
- Keep the share card action visible after the map is generated.

### `/profile` User Space

The page must:

- Allow Telegram users to remain signed in via Mini App identity.
- Show Stars access products as user benefits, not internal growth controls.
- Provide an invite link with copy action.
- Show benefit cards: invite friends, saved reports, daily reminder.
- Avoid words such as Affiliate Program, Managed Bots, Growth Preview, or commercial strategy labels.

## 6. Pricing

Telegram Mini App digital products use Stars:

- Daily insight: 29 Stars.
- Complete map: 99 Stars.
- Pro monthly style access: 399 Stars.

Web pricing may continue using USD and Stripe.

## 7. Visual Direction

- Theme: dark bronze, amber, emerald, subtle purple accent.
- Assets: Sanxingdui-style bronze mask and bronze tree.
- Typography: high contrast, no low-opacity body text below readable threshold.
- Layout: mobile-first, Telegram-native, fixed bottom nav.
- UI style: cards no more than necessary, strong touch targets, no nested cards that make hierarchy confusing.

## 8. Success Criteria

Local acceptance:

- `/tg`, `/daily`, `/fortune`, and `/profile` load locally.
- `/tg` has no internal strategy vocabulary.
- `/daily` shows Stars pricing in Telegram-aware code and can share a daily card.
- `/fortune` continues to support Stars checkout path.
- `/profile` shows user-facing Stars access and invite benefits.
- `npm test` passes.
- `npm run build` passes.
- Browser screenshots confirm text is readable on mobile-sized viewport.

Business acceptance:

- User can understand what to do within 5 seconds.
- Free daily experience feels useful before payment.
- Stars payment appears as a natural next step, not a forced wall.
- Sharing and invitation are visible but not pushy.

