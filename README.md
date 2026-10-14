# Compufield Bandra (West): One-to-One Digital Marketing Landing Page

Landing page for Google Ads and social media campaigns, aimed at **business owners** who want to learn digital marketing **one-to-one** (no group batches) at Compufield's **Bandra (West)** centre.

## What's in this repo

| Path | What it is |
|---|---|
| `index.html` | **The page to upload.** Self-contained: logo, photos and video thumbnails are built in. |
| `apps-script/Code.gs` | Google Apps Script behind the form: saves each lead to a Google Sheet and emails it to fkhairaz@gmail.com (plus an optional confirmation email to the lead). |
| `src/page-template.html` | Editable source of the page, with image placeholders. |
| `src/images/` | Logo, centre photos and video thumbnails. |
| `src/build.py` | Rebuilds `index.html` from the template: `python src/build.py` |

## Key settings

- **Call / WhatsApp:** +91 98333 61338 (`WA_NUMBER` in the page script)
- **Lead form endpoint:** `LEAD_ENDPOINT` in the page script points to the deployed Apps Script web app
- **Social media ad group:** add `?focus=social` to the page URL to switch the headline to social media marketing
- **Tracking:** UTM `utm_source` / `utm_campaign` are saved with each lead; the form fires `generate_lead` (gtag), `Lead` (Meta Pixel) and a `lead_submitted` dataLayer event if those tags are installed

## Going live

1. Upload `index.html` to compufield.com (e.g. `compufield.com/digital-marketing-bandra-west.html`).
2. Fill the form once and check that a new row appears in the Google Sheet and an email arrives from "Compufield Leads".
3. The YouTube reviews play in a pop-up only on the live site; YouTube blocks them when the file is opened locally.
