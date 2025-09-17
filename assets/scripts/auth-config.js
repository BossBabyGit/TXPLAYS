/**
 * Discord OAuth configuration for the TxPlays front-end.
 *
 * Replace the placeholder values below with the credentials from your
 * Discord application at https://discord.com/developers/applications.
 *
 * Required values:
 *  - clientId:       The "Application ID" from the General Information tab.
 *  - redirectUri:    One of the Redirects you add under the OAuth2 section.
 *                     This must exactly match the URL of the page that should
 *                     receive the Discord OAuth response (including protocol).
 *  - scopes:         The OAuth scopes to request. "identify" is enough for
 *                     this integration because we only need basic profile data.
 *
 * You can override these values at runtime before main.js loads if you prefer
 * to inject environment-specific settings.
 */
window.__DISCORD_AUTH_CONFIG__ = window.__DISCORD_AUTH_CONFIG__ || {
  clientId: "YOUR_DISCORD_CLIENT_ID",
  redirectUri: "https://your-domain.example/index.html",
  scopes: ["identify"]
};
