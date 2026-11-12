# Shared style content: Merchant Center custom view

A Merchant Center **custom view** shown on the **Product details > General** tab (locator `products.product_details.general`). For a product that points to shared style content it shows the Custom Object `style-content/<style id>` (description, details, material and care in every language), lists the colour products that share it, and lets users with the *manage* permission edit it once for all of them.

- Data model: every colour product of a style references one Custom Object through the non-searchable attribute `style-content`; the storefront resolves it in one GraphQL request (see `HB/site/lib/ct/catalog.ts`, `getStyle`).
- Saves use `createOrUpdateCustomObject` with the Custom Object `version`, so two people editing at the same time cannot silently overwrite each other.
- Scopes (least privilege): view = `view_products`, `view_key_value_documents`; manage = `manage_key_value_documents`.

## Develop
```bash
cd merchant-center-custom-view
npm install
npm test            # jest with the application-shell test utils
npx mc-scripts login && npm start    # http://localhost:3001 against hb_trial_2026
```
Needs Node >= 22.23.4 or 24.22+ (see `.nvmrc`).

## Deploy with Connect
1. In the Merchant Center (organization admin): Organization settings > Custom Views > create a view with a placeholder URL, locator `products.product_details.general`, the two permission groups above. Copy its **View ID**.
2. Push this folder to a Git repository and tag a release (private repositories need access for the GitHub user `connect-mu`).
3. `commercetools connect connectorstaged create --repository-url <url> --repository-tag <tag> --name shared-style-content-view --creator-email <email>`, then `... connectorstaged publish --key <key>`.
4. `commercetools connect deployment create --connector-key <key> --region europe-west1.gcp --type production` with `CUSTOM_VIEW_ID` and `CLOUD_IDENTIFIER=gcp-eu`.
5. Read the deployment's URL (`deployment describe`) and put it in the custom view's URL in the Merchant Center.
