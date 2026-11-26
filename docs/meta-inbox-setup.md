# Meta messaging inbox setup

The admin inbox receives Facebook Page Messenger and WhatsApp Business Platform messages. It does not connect to personal Facebook accounts or the WhatsApp consumer app.

## Server configuration

Set these values in the API environment (never in the browser or source control). The connection buttons remain disabled until the corresponding provider configuration is complete:

```dotenv
META_APP_SECRET=
META_APP_ID=
META_GRAPH_API_VERSION=v27.0
META_TOKEN_ENCRYPTION_KEY=<64-hex-characters>
META_WEBHOOK_VERIFY_TOKEN=<long-random-secret>
META_WHATSAPP_CONFIG_ID=
META_MESSENGER_CONFIG_ID=
```

Generate a distinct token encryption key with `openssl rand -hex 32`. `META_APP_SECRET` validates `X-Hub-Signature-256` on incoming webhook requests. The API stores connected account tokens encrypted with AES-256-GCM. Keep these values stable across deployments and restart the API after setting them.

## Meta configuration

1. Create or select a Meta developer app with WhatsApp and Messenger products. Configure the allowed admin domain and the required business permissions. Create a WhatsApp **Embedded Signup** configuration and a Facebook **Business Login** configuration, then set their IDs as `META_WHATSAPP_CONFIG_ID` and `META_MESSENGER_CONFIG_ID`.
2. For both products, use `https://<public-api-host>/api/v1/inbox/webhook` as the webhook callback and `META_WEBHOOK_VERIFY_TOKEN` as the verify token. Subscribe to WhatsApp `messages` and Page `messages` events.
3. In the admin Messages page, choose **Manage connections**. An administrator can sign in with Meta, select an authorized Page for Messenger, or finish WhatsApp Embedded Signup. The API exchanges the temporary authorization code, subscribes the chosen asset to webhooks, and stores its token encrypted. A new WhatsApp API number may require its six-digit two-step PIN for registration.
4. If Meta offers a QR code during WhatsApp Embedded Signup for an eligible WhatsApp Business App number, complete that step in Meta's window. A generic WhatsApp **Linked devices** QR does not grant the Cloud API permissions needed for this inbox.
5. For production conversations outside app roles, complete Meta's required app review, business verification, and permission/access setup. Test with a real authorized Page and phone number before relying on the inbox for customers.

Existing manual `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` and `MESSENGER_PAGE_ACCESS_TOKEN` / `MESSENGER_PAGE_ID` environment pairs remain supported for an already configured channel. They cannot be disconnected through the admin panel; remove those environment values instead. The new connection cards represent accounts authorized through the admin panel.

## Gmail inbox

Gmail uses Google OAuth; it does not use an email password or an app password. Create a Google OAuth **Web application** client and configure its authorized redirect URI to `https://<public-api-host>/api/v1/inbox/google/callback`. Set these server-only API variables:

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://<public-api-host>/api/v1/inbox/google/callback
GOOGLE_OAUTH_STATE_SECRET=<long-random-secret>
GMAIL_TOKEN_ENCRYPTION_KEY=<64-hex-characters>
ADMIN_PUBLIC_URL=https://<public-admin-host>
```

Generate a distinct 32-byte encryption key, for example with `openssl rand -hex 32`. The API stores the refresh token encrypted with AES-256-GCM. An administrator then selects **Connect Gmail** in Messages Inbox and approves Gmail read/send access in Google. Google may require OAuth app verification before external users can grant the requested Gmail scopes. Do not put OAuth secrets or encryption keys in browser variables.

For local testing, use `http://localhost:4000/api/v1/inbox/google/callback` as the redirect URI and `http://localhost:3012` as the admin URL. Google permits localhost redirect URIs for development OAuth clients.

The API webhook must be reachable from Meta over HTTPS. Localhost alone cannot receive Meta's live callbacks; use a secure temporary tunnel for local testing.

Before deploying the API, back up the `gw-site-db` database, then run `npm run db:migrate-inbox` once in the API application container. This applies only the inbox schema migrations; it does not run older CMS/content migrations. The script is safe to rerun and leaves unrelated production data unchanged.

## Reply limits

The inbox sends plain text replies only while the customer's 24-hour messaging window is open. Approved WhatsApp template sending is not included. Meta may reject messages when the app, Page, number, token, permissions, or recipient eligibility is not configured correctly.

Official references: [WhatsApp Business Platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/overview), [Messenger Quick Start](https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start), [Page webhooks](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-pages), [Google OAuth web server flow](https://developers.google.com/identity/protocols/oauth2/web-server), [Gmail API scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [Gmail API message listing](https://developers.google.com/workspace/gmail/api/guides/list-messages), [Gmail API sending](https://developers.google.com/workspace/gmail/api/guides/sending).
