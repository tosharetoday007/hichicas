# Hichicas AI Widget

AI-powered skin care assistant with Amazon affiliate product links for hichicas.com (Blogger/Blogspot).

## Files in this repo

| File | Purpose |
|---|---|
| `hichicas-widget.css` | All widget styles |
| `hichicas-widget.js` | All widget logic + AI + Amazon links |
| `blogger-snippet.html` | Tiny snippet to paste into each Blogger post |

---

## Setup Instructions

### Step 1 — Create GitHub Account & Repo
1. Go to [github.com](https://github.com) and sign up (free)
2. Click **New Repository**
3. Name it: `hichicas`
4. Set to **Public**
5. Click **Create repository**

### Step 2 — Upload Files
1. Upload `hichicas-widget.css` and `hichicas-widget.js` to the repo
2. Click **Add file → Upload files**
3. Drag and drop both files → Click **Commit changes**

### Step 3 — Enable GitHub Pages
1. Go to repo **Settings → Pages**
2. Under **Source** select: **Deploy from a branch**
3. Branch: **main** → Folder: **/ (root)**
4. Click **Save**
5. Wait 2-3 minutes
6. Your files will be live at:
   - `https://YOUR-USERNAME.github.io/hichicas/hichicas-widget.css`
   - `https://YOUR-USERNAME.github.io/hichicas/hichicas-widget.js`

### Step 4 — Add Your API Key
1. Open `hichicas-widget.js`
2. Find line: `var API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';`
3. Replace with your real Anthropic API key
4. Commit the change

### Step 5 — Update URLs in Blogger Snippet
1. Open `blogger-snippet.html`
2. Replace ALL instances of `YOUR-USERNAME` with your actual GitHub username
3. Example: `https://hichicas.github.io/hichicas/hichicas-widget.css`

### Step 6 — Add to Blogger Theme (loads on ALL posts)
1. Go to **Blogger Dashboard → Theme → Edit HTML**
2. Find `</body>` at the bottom
3. Paste the CSS link just before `</body>`:
```
<link rel="stylesheet" href="https://YOUR-USERNAME.github.io/hichicas/hichicas-widget.css"/>
```
4. Save theme

### Step 7 — Add Widget HTML to Posts
- Paste `blogger-snippet.html` content at the end of each post in **HTML editor mode**
- Since CSS and JS load from GitHub, each post only has ~50 lines instead of 360

---

## Page Size Comparison

| Before (inline code) | After (GitHub Pages) |
|---|---|
| ~360 lines per post | ~55 lines per post |
| ~18KB per page | ~2KB per page |
| Bot crawls full code every post | Bot sees tiny clean HTML only |
| Slow XML parsing | Fast clean XML |

---

## Updating the Widget

When you want to change design or add features:
1. Edit `hichicas-widget.css` or `hichicas-widget.js` on GitHub
2. Commit the change
3. All Blogger posts update **automatically** — no need to edit each post

---

## Amazon Affiliate Tag
Your tag `latestfotocom-20` is already set in `hichicas-widget.js`.
All product links automatically include it.

---

## License
Free to use for hichicas.com
