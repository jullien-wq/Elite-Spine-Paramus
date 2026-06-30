# Connecting the Forms to a Google Sheet

This site is a static website (no server), so the forms send their data to a
**Google Apps Script Web App** that you own. The script writes every submission
into your spreadsheet, **one tab per form**. It's free, permanent, and once you
authorize it during setup, **your visitors are never prompted to "activate" or
approve anything** — submissions land in the Sheet silently.

Total setup time: ~10 minutes, done once.

---

## What you'll end up with

A spreadsheet like this, where each form fills its own tab automatically:

| Tab name | Filled by |
|---|---|
| **Appointment Requests** | The "Request an Appointment" form (both Home & Conditions pages) |
| *(future form name)* | Any new form you add later with its own `data-sheet-tab` |

Each tab has a header row created automatically:
`Timestamp · Source Page · name · phone · email · service · message`

---

## Step 1 — Create the spreadsheet

1. Go to <https://sheets.google.com> and create a **blank spreadsheet**.
2. Name it something like **"Elite Spine — Website Leads."**
3. You can leave the default `Sheet1` tab; the script makes its own named tabs
   and you can delete `Sheet1` afterward.

## Step 2 — Open the Apps Script editor

1. In the spreadsheet, click **Extensions → Apps Script**.
2. Delete any starter code in the `Code.gs` file it opens.
3. Open the file **`google-apps-script/Code.gs`** from this project, copy its
   **entire** contents, and paste it into the Apps Script editor.
4. Click the **Save** (💾) icon.

> Because you opened Apps Script *from inside the spreadsheet*, the script is
> already bound to it — you don't need to paste any spreadsheet ID. (Leave
> `SPREADSHEET_ID = ''`.)

## Step 3 — Deploy it as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** `Elite Spine form endpoint`
   - **Execute as:** **Me (your@email.com)**  ← important
   - **Who has access:** **Anyone**  ← important (this is what lets the
     website post without anyone signing in)
4. Click **Deploy**.

## Step 4 — Authorize once (the only approval ever needed)

1. Google will pop up **"Authorization required."** Click **Authorize access**.
2. Choose your Google account.
3. You may see **"Google hasn't verified this app."** This is normal for your
   own scripts. Click **Advanced → Go to Elite Spine form endpoint (unsafe)**,
   then **Allow**.
   - *This one-time step is you approving your own script. After this, the form
     works for everyone with no prompts — there is no "activation on first
     submission" for your visitors.*
4. Apps Script shows a **Web app URL** ending in `/exec`. **Copy it.**

## Step 5 — Paste the URL into the site

1. Open **`app.js`** in this project.
2. Near the top of the form section, find:
   ```js
   const SHEET_ENDPOINT = '';
   ```
3. Paste your Web app URL between the quotes:
   ```js
   const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfy..../exec';
   ```
4. Save. Done — submissions now flow into your Sheet.

## Step 6 — Test it

1. Open the website, scroll to **Request an Appointment**, fill it out, submit.
2. Check your spreadsheet — a new row should appear in the
   **Appointment Requests** tab within a couple seconds.

---

## How "one tab per form" works

Each `<form>` in the HTML carries an attribute that names its destination tab:

```html
<form class="cform__form" data-sheet-tab="Appointment Requests" ...>
```

The script reads that name and routes the submission to the matching tab,
**creating the tab and its header row on first use.** To add another form later
(say a newsletter or a contact form) that lands in its own tab, just give it:

```html
<form class="cform__form" data-sheet-tab="Newsletter Signups" novalidate>
  ...fields...
</form>
```

No script changes needed — a "Newsletter Signups" tab will appear the first time
that form is submitted. New fields you add to a form automatically become new
columns.

---

## Get an email alert on every submission (optional)

If you'd also like an email whenever a lead comes in, add this to `Code.gs`
right after `sheet.appendRow(row);`:

```js
MailApp.sendEmail({
  to: 'elitespineparamus@gmail.com',
  subject: 'New website lead: ' + tabName,
  body: headers.map(function (h, i) { return h + ': ' + row[i]; }).join('\n')
});
```

Re-deploy after editing: **Deploy → Manage deployments → (edit) → Version: New
version → Deploy.**

---

## Important notes & troubleshooting

- **After editing `Code.gs` you must re-deploy a new version** (Manage
  deployments → Edit → New version), or the live URL keeps running the old code.
- **Keep the same deployment URL.** Always use "Manage deployments → Edit" to
  push changes so the `/exec` URL stays the same. Creating a brand-new
  deployment makes a *new* URL you'd have to paste into `app.js` again.
- **Nothing showing up?**
  - Make sure `SHEET_ENDPOINT` in `app.js` is the `/exec` URL (not `/dev`).
  - Confirm the deployment's "Who has access" is **Anyone**.
  - Open the Web app URL directly in a browser — it should say
    *"Elite Spine form endpoint is running."*
- **Spam:** if you start getting junk, tell me and I'll add a honeypot field or
  reCAPTCHA.
- **Privacy:** submissions include the name, phone, email, chosen service, and
  message a patient typed. Keep the spreadsheet access limited to staff. Avoid
  collecting detailed medical history through this form.
