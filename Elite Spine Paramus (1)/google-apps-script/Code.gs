/**
 * Elite Spine — Form → Google Sheet endpoint
 * =================================================================
 * Receives form posts from index.html / conditions-services.html
 * and writes each submission into a tab named after the form
 * (passed as the "_tab" field). Creates the tab and header row
 * automatically on first use, and adds new columns if a form
 * ever sends a new field.
 *
 * SETUP: see SHEET-SETUP.md. In short:
 *   1. Paste this into the Apps Script editor of your Sheet
 *      (Extensions → Apps Script).
 *   2. Deploy → New deployment → Web app
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   3. Authorize once (this is the only approval ever needed —
 *      visitors are NEVER prompted).
 *   4. Copy the Web app URL into SHEET_ENDPOINT in app.js.
 * =================================================================
 */

// Leave blank to use the spreadsheet this script is bound to.
// Or paste a specific spreadsheet ID to target another file.
var SPREADSHEET_ID = '';

// Paste your reCAPTCHA v3 SECRET key here (NOT the site key).
// Leave blank to skip verification (forms still record).
var RECAPTCHA_SECRET = '';

// Submissions scoring below this are treated as bots and rejected.
// 0.5 is Google's recommended starting threshold.
var RECAPTCHA_MIN_SCORE = 0.5;

// Email address that gets an alert on every new submission.
// Leave blank to disable email notifications.
var NOTIFY_EMAIL = 'elitespineparamus@gmail.com';

// Verify a reCAPTCHA v3 token with Google. Returns true if the token
// is valid and scores at or above the threshold (or if no secret is set).
function verifyRecaptcha(token) {
  if (!RECAPTCHA_SECRET) return true; // verification disabled
  if (!token) return false;
  try {
    var res = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'post',
      payload: { secret: RECAPTCHA_SECRET, response: token },
      muteHttpExceptions: true
    });
    var data = JSON.parse(res.getContentText());
    return data.success === true && (typeof data.score !== 'number' || data.score >= RECAPTCHA_MIN_SCORE);
  } catch (err) {
    return false;
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // avoid two submissions colliding

    // ---- Parse incoming fields (form-encoded or JSON) ----
    var params = {};
    if (e && e.postData && e.postData.type === 'application/json') {
      params = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      params = e.parameter;
    }

    // Which tab does this submission belong in?
    var tabName = String(params._tab || 'Submissions').substring(0, 90).trim() || 'Submissions';
    var source  = params._source || '';
    var token   = params._recaptcha || '';
    delete params._tab;
    delete params._source;
    delete params._recaptcha;

    // ---- Reject bots: verify the reCAPTCHA token ----
    if (!verifyRecaptcha(token)) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'recaptcha_failed' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ---- Open spreadsheet + get/create the tab ----
    var ss = SPREADSHEET_ID
      ? SpreadsheetApp.openById(SPREADSHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();

    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      sheet.appendRow(['Timestamp', 'Source Page']);
      sheet.setFrozenRows(1);
      sheet.getRange('1:1').setFontWeight('bold');
    }

    // ---- Read current headers, add any new field columns ----
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    Object.keys(params).forEach(function (key) {
      if (headers.indexOf(key) === -1) {
        headers.push(key);
        sheet.getRange(1, headers.length).setValue(key).setFontWeight('bold');
      }
    });

    // ---- Build the row in header order ----
    var row = headers.map(function (h) {
      if (h === 'Timestamp') return new Date();
      if (h === 'Source Page') return source;
      return params[h] !== undefined ? params[h] : '';
    });
    sheet.appendRow(row);

    // ---- Email the owner on every new submission ----
    if (NOTIFY_EMAIL) {
      try {
        var lines = headers.map(function (h, i) {
          var v = row[i];
          if (h === 'Timestamp' && v instanceof Date) v = v.toLocaleString();
          return h + ': ' + v;
        });
        var who = params.name ? (' from ' + params.name) : '';
        MailApp.sendEmail({
          to: NOTIFY_EMAIL,
          subject: 'New website lead' + who + ' — ' + tabName,
          replyTo: params.email || NOTIFY_EMAIL,
          body: 'A new request came in through the website:\n\n' +
                lines.join('\n') +
                '\n\n— Elite Spine website'
        });
      } catch (mailErr) {
        // Don't fail the submission if the email can't send.
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Optional: lets you open the Web App URL in a browser to confirm it's live.
function doGet() {
  return ContentService
    .createTextOutput('Elite Spine form endpoint is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
