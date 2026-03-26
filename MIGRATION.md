# Domain Migration: Network Solutions → Cloudflare

**Domain:** emmaus24.org
**Current Registrar:** Network Solutions
**Domain Expiry:** April 18, 2026
**Target Registrar:** Cloudflare Registrar

---

## Pre-Migration Checklist

- [ ] Cloudflare account created (cloudflare.com, free)
- [ ] New site tested and working at emmaus24-website.pages.dev
- [ ] Fastmail Family plan signed up and configured
- [ ] Current DNS records documented (see below)
- [ ] Stakeholders notified of migration window

---

## Step 1: Document Current DNS Records

Before touching anything, record every DNS record currently set at Network Solutions. Log into Network Solutions and screenshot or copy all records (A, CNAME, MX, TXT, etc.).

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | (current IP) | |
| CNAME | www | (current value) | |
| MX | @ | (current mail server) | |
| TXT | @ | (any SPF/DKIM records) | |
| ... | ... | ... | |

Fill this table in before proceeding. This is your safety net.

---

## Step 2: Add Domain to Cloudflare (Before Transfer)

This step moves DNS management to Cloudflare while the domain is still registered at Network Solutions. **This does not transfer the domain yet.**

1. Log into Cloudflare → **Add a site** → enter `emmaus24.org`
2. Select the **Free** plan
3. Cloudflare will scan existing DNS records — **verify they match** your table from Step 1
4. Add any missing records manually
5. Cloudflare will give you two nameservers (e.g., `anna.ns.cloudflare.com`, `bob.ns.cloudflare.com`)
6. **Do not change nameservers yet** — just note them down

---

## Step 3: Lower TTL (24-48 Hours Before Cutover)

If Network Solutions allows editing TTL values, lower them to 300 seconds (5 minutes) on all records **at least 24 hours before** you plan to switch nameservers. This ensures DNS caches expire quickly when you do switch.

---

## Step 4: Switch Nameservers at Network Solutions

This is the moment DNS management moves to Cloudflare. The domain is still registered at Network Solutions.

1. Log into Network Solutions → Domain Manager → `emmaus24.org`
2. Find **Nameservers** or **DNS Management**
3. Change nameservers to the two Cloudflare gave you in Step 2
4. Save changes

**What happens:** DNS queries for emmaus24.org start resolving via Cloudflare. Because you replicated all records in Step 2, **the site and email continue working exactly as before**. Propagation takes minutes to a few hours.

5. Wait for Cloudflare dashboard to show the domain as **Active** (green checkmark)
6. Verify the site loads normally at emmaus24.org

---

## Step 5: Configure Fastmail Email DNS

With DNS now managed in Cloudflare, add Fastmail's required records:

**MX Records:**

| Priority | Value |
|----------|-------|
| 10 | in1-smtp.messagingengine.com |
| 20 | in2-smtp.messagingengine.com |

**TXT Records (SPF):**

| Host | Value |
|------|-------|
| @ | `v=spf1 include:spf.messagingengine.com ~all` |

**CNAME Records (DKIM):**

| Host | Value |
|------|-------|
| fm1._domainkey | fm1.emmaus24.org.dkim.fmhosting.com |
| fm2._domainkey | fm2.emmaus24.org.dkim.fmhosting.com |
| fm3._domainkey | fm3.emmaus24.org.dkim.fmhosting.com |

**TXT Record (DMARC):**

| Host | Value |
|------|-------|
| _dmarc | `v=DMARC1; p=none; rua=mailto:dmarc@emmaus24.org` |

> Note: Start DMARC with `p=none` (monitor only). After confirming email works correctly for a few weeks, tighten to `p=quarantine` or `p=reject`.

**Verify in Fastmail:** Go to Settings → Custom Domains → emmaus24.org → Verify DNS. All checks should pass.

**Test:** Send test emails to/from emmaus24.org addresses. Check deliverability at https://www.mail-tester.com.

---

## Step 6: Point Domain to Cloudflare Pages

Now switch the website from the old host to the new Cloudflare Pages site.

1. In Cloudflare DNS, **delete** the old A record for `@` (or change it)
2. Add a **CNAME** record:
   - Name: `@`
   - Target: `emmaus24-website.pages.dev`
   - Proxy: enabled (orange cloud)
3. Add/update the **CNAME** for `www`:
   - Name: `www`
   - Target: `emmaus24-website.pages.dev`
   - Proxy: enabled (orange cloud)
4. In Cloudflare Pages dashboard, go to the `emmaus24-website` project → **Custom domains** → Add `emmaus24.org` and `www.emmaus24.org`

**This is the cutover moment.** Most users will see the new site within minutes. Worst case: a few hours for aggressive DNS caches.

---

## Step 7: Enable Cloudflare Security Settings

1. **SSL/TLS** → Set to **Full (Strict)**
2. **Edge Certificates** → Enable **Always Use HTTPS**
3. **Edge Certificates** → Enable **HSTS** (include subdomains, max-age 6 months)
4. **Security** → Enable **Browser Integrity Check**
5. **WAF** → Free managed rules are on by default

---

## Step 8: Transfer Domain Registration to Cloudflare

Now that everything is working on Cloudflare's DNS, transfer the domain registration itself. This saves money on future renewals (~$12/yr vs $40-50/yr at Network Solutions).

1. **At Network Solutions:**
   - Unlock the domain (disable Transfer Lock / Domain Lock)
   - Request an **EPP authorization code** (also called transfer key or auth code)
   - It will be emailed to the domain's admin contact

2. **At Cloudflare:**
   - Go to **Registrar** → **Transfer Domains**
   - Enter `emmaus24.org`
   - Enter the EPP code
   - Pay ~$12 (includes 1 year renewal added to current expiry)
   - Confirm contact information

3. **Approve the transfer:**
   - Network Solutions will send a confirmation email to the domain admin
   - Click the approval link (or do nothing — it auto-approves after ~5 days)

4. **Wait 5-7 days** for the transfer to complete

> **Important:** Since the domain expires April 18, start this process no later than **April 5** to be safe. If time is too tight, renew at Network Solutions first ($40-50 for 1 year), then transfer at your leisure.

---

## Step 9: Post-Migration Verification

- [ ] emmaus24.org loads the new site correctly
- [ ] www.emmaus24.org redirects to emmaus24.org (or vice versa)
- [ ] All pages work: Home, About, Staff, Sermons, Catechesis, Resources, Gallery, Contact
- [ ] HTTPS works with no mixed content warnings
- [ ] Email sending works (send test from info@emmaus24.org)
- [ ] Email receiving works (send test to info@emmaus24.org)
- [ ] SPF/DKIM/DMARC passing (check headers of received test email)
- [ ] mail-tester.com score is 9/10 or higher
- [ ] Old host subscription cancelled (after confirming everything works)
- [ ] Domain shows Cloudflare as registrar (after transfer completes)

---

## Rollback Plan

If something goes wrong after the DNS cutover (Step 6):

1. Change the CNAME records back to the old hosting IP/values (documented in Step 1)
2. DNS will propagate back within minutes
3. Investigate and fix the issue before trying again

This is why documenting current DNS records in Step 1 is critical.

---

## Timeline

| Date | Action |
|------|--------|
| **Now** | Complete Steps 1-2 (add domain to Cloudflare, document DNS) |
| **1-2 days later** | Step 3 (lower TTL) |
| **Next day** | Step 4 (switch nameservers to Cloudflare) |
| **Same day** | Step 5 (configure Fastmail DNS) |
| **After testing email** | Step 6 (point domain to Cloudflare Pages) |
| **After verifying site** | Step 7 (enable security settings) |
| **By April 5 at latest** | Step 8 (initiate domain transfer) |
| **April 5-12** | Transfer completes |
| **After transfer** | Step 9 (final verification, cancel old hosting) |

---

## Key Contacts & Credentials Needed

- [ ] Network Solutions login (for domain unlock + EPP code)
- [ ] Cloudflare account login
- [ ] Fastmail admin account login
- [ ] GitHub account with repo access
- [ ] Admin email address on file at Network Solutions (receives transfer approval)
