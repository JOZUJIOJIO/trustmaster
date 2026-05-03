# Telegram Mini App Setup

Kairós now supports a shared web + Telegram Mini App runtime.

## Required Environment Variables

```env
TELEGRAM_BOT_TOKEN=123456:your_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

`TELEGRAM_BOT_TOKEN` is used only on the server to validate `Telegram.WebApp.initData`.

## Supabase Migration

Run the Telegram tables from `supabase/schema.sql`:

- `telegram_accounts`
- `telegram_events`

The service role writes these tables from `/api/telegram/auth` and `/api/telegram/events`.

## BotFather Configuration

1. Create or open your bot with `@BotFather`.
2. Use `/setdomain` and set the production domain.
3. Use `/newapp` or Mini App settings to create the Mini App.
4. Set the Mini App URL:

```text
https://your-production-domain.com/tg
```

5. Set the menu button URL to the same `/tg` entry.
6. For referral links, use:

```text
https://t.me/your_bot_username?startapp=ref_REFERRALCODE
```

The app stores `ref_REFERRALCODE` as the Kairós referral code.

## Implemented Routes

- `/tg`: Telegram-optimized entry page.
- `/api/telegram/auth`: validates Telegram initData and upserts Telegram users.
- `/api/telegram/events`: records Mini App events.
- `/api/telegram/share`: returns a Telegram `startapp` share link when a bot username is configured.
- `/admin/telegram`: admin view for Telegram users and events.

## Notes

The web app still works as a normal website. Telegram-specific behavior only activates when `window.Telegram.WebApp` exists.
