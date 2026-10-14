/**
 * Compufield – Business Owner Landing Page → Google Sheet + Email
 * ----------------------------------------------------------------
 * Every form submission is:
 *   1. added as a new row in the "Leads" tab of this Google Sheet
 *   2. emailed to NOTIFY_EMAIL
 *   3. (optional) sent a short confirmation email, if the lead gave an email
 *
 * SETUP (about 5 minutes):
 *   1. Create a new Google Sheet (e.g. "Compufield Bandra – LP Leads"), signed in as fkhairaz@gmail.com
 *   2. Extensions → Apps Script. Delete everything, paste this whole file, click Save.
 *   3. Click Deploy → New deployment → gear icon → "Web app"
 *        Description: LP leads
 *        Execute as:  Me
 *        Who has access: Anyone
 *      Click Deploy → Authorise access (choose your Google account → Advanced → Go to project → Allow)
 *   4. Copy the "Web app URL" (ends in /exec) and paste it into the landing page,
 *      in the line:  var LEAD_ENDPOINT = "PASTE_YOUR_WEB_APP_URL_HERE";
 *   5. Test: fill the form once on the page. You should get an email and a new row.
 *
 * If you edit this script later: Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy.
 * (The URL stays the same.)
 */

var NOTIFY_EMAIL   = "fkhairaz@gmail.com";
var SHEET_NAME     = "Leads";
var SEND_AUTOREPLY = true;               // set to false to stop the confirmation email to leads
var WHATSAPP       = "919833361338";
var CALL_NUMBER    = "+91 98333 61338";

var COLUMNS = ["Timestamp", "Name", "Mobile", "Email", "Business type", "Start with",
               "Modules picked", "Source / campaign", "Page", "Status", "Notes"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var p = (e && e.parameter) || {};
    // Simple bot trap: the page leaves "website" empty; bots usually fill it.
    if (p.website) return json_({ ok: true });

    var lead = {
      name:     clean_(p.name, 80),
      phone:    clean_(p.phone, 20),
      email:    clean_(p.email, 120),
      business: clean_(p.business_type, 60),
      goal:     clean_(p.goal, 60),
      modules:  clean_(p.modules, 400),
      source:   clean_(p.source, 200),
      page:     clean_(p.page, 300)
    };
    if (!lead.name || !lead.phone) return json_({ ok: false, error: "missing name or phone" });

    var sheet = getSheet_();
    var when = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd-MMM-yyyy HH:mm");
    sheet.appendRow([when, lead.name, "'" + lead.phone, lead.email, lead.business, lead.goal,
                     lead.modules, lead.source, lead.page, "New", ""]);

    notify_(lead, when);
    if (SEND_AUTOREPLY && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) autoreply_(lead);

    return json_({ ok: true });
  } catch (err) {
    try { MailApp.sendEmail(NOTIFY_EMAIL, "⚠ LP lead form error", String(err) + "\n\n" + JSON.stringify(e && e.parameter)); } catch (x) {}
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the /exec URL in a browser to check it's live.
function doGet() { return json_({ ok: true, service: "Compufield LP leads" }); }

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(COLUMNS);
    sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold").setBackground("#13295b").setFontColor("#ffffff");
    sh.setFrozenRows(1);
    sh.setColumnWidths(1, COLUMNS.length, 150);
  }
  return sh;
}

function notify_(l, when) {
  var wa = "https://wa.me/91" + l.phone.replace(/\D/g, "").slice(-10) + "?text=" +
           encodeURIComponent("Hi " + l.name + ", this is Compufield Bandra (West). Thanks for booking a free one-to-one digital marketing demo class! When would be a good time for you?");
  var rows = [
    ["Name", l.name], ["Mobile", l.phone], ["Email", l.email || "—"],
    ["Business", l.business || "—"], ["Wants to start with", l.goal || "—"],
    ["Modules they picked", l.modules || "—"], ["Source", l.source || "—"], ["Received", when]
  ].map(function (r) {
    return '<tr><td style="padding:8px 12px;color:#5c6480;font-weight:bold;border-bottom:1px solid #eee">' + r[0] +
           '</td><td style="padding:8px 12px;border-bottom:1px solid #eee">' + esc_(r[1]) + "</td></tr>";
  }).join("");
  var html =
    '<div style="font-family:Arial,sans-serif;max-width:560px">' +
    '<h2 style="color:#13295b;margin:0 0 6px">New demo class request 🎯</h2>' +
    '<p style="color:#5c6480;margin:0 0 16px">Business owner landing page, Bandra (West)</p>' +
    '<table style="border-collapse:collapse;width:100%;font-size:14px">' + rows + "</table>" +
    '<p style="margin:20px 0">' +
    '<a href="tel:+91' + l.phone.replace(/\D/g, "").slice(-10) + '" style="background:#13295b;color:#fff;padding:10px 16px;border-radius:20px;text-decoration:none;margin-right:8px">Call ' + esc_(l.name) + "</a>" +
    '<a href="' + wa + '" style="background:#25d366;color:#05371a;padding:10px 16px;border-radius:20px;text-decoration:none">WhatsApp ' + esc_(l.name) + "</a></p></div>";
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: "New demo lead: " + l.name + (l.business ? " (" + l.business + ")" : "") + " – Bandra (West) LP",
    htmlBody: html,
    replyTo: l.email || NOTIFY_EMAIL,
    name: "Compufield Leads"
  });
}

function autoreply_(l) {
  var html =
    '<div style="font-family:Arial,sans-serif;max-width:560px;color:#141a2e;line-height:1.6">' +
    "<p>Hi " + esc_(l.name) + ",</p>" +
    "<p>Thanks for booking a <b>free one-to-one digital marketing demo class</b> at Compufield, Bandra (West). " +
    "Your request is in, and we'll call you on <b>" + esc_(l.phone) + "</b> to fix a time that suits you.</p>" +
    (l.modules ? "<p>Topics you're interested in: <i>" + esc_(l.modules) + "</i></p>" : "") +
    "<p><b>For the demo, bring</b> your phone and access to your business Instagram / Facebook / Google accounts, so you can see how the training works on your own business.</p>" +
    "<p>Can't wait? WhatsApp us: <a href=\"https://wa.me/" + WHATSAPP + "\">+91 98333 61338</a> or call " + CALL_NUMBER + ".</p>" +
    "<p><b>Where:</b> O Priya Building, 1st Floor, Block 6, Dr. Peter Dias Road, Near Mehboob Studio, Bandra (West), Mumbai 400050 " +
    '(<a href="https://www.google.com/maps/search/?api=1&query=Compufield+Bandra+West+Dr+Peter+Dias+Road+Mumbai">map</a>)</p>' +
    "<p>See you soon,<br>Team Compufield</p></div>";
  MailApp.sendEmail({
    to: l.email,
    subject: "Your free one-to-one demo class at Compufield Bandra (West)",
    htmlBody: html,
    replyTo: NOTIFY_EMAIL,
    name: "Compufield Bandra (West)"
  });
}

function clean_(v, max) { return String(v || "").replace(/[\r\n\t]+/g, " ").replace(/^[=+\-@]/, "'$&").trim().slice(0, max); }
function esc_(s) { return String(s).replace(/[&<>"]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]; }); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
