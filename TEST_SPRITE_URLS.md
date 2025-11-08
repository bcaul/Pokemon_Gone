# Testing Sprite URLs

## The Problem
All sprite URLs are failing to load (404 errors), even with `/icons/` endpoint.

## Possible Causes

### 1. URL Pattern is Wrong
The Pokengine CDN might use a different URL pattern than we think.

### 2. Sprite IDs are Wrong
The IDs we extracted might not be the correct sprite IDs for the CDN.

### 3. CORS Issues
The CDN might block cross-origin requests (though this would show CORS errors, not 404s).

## How to Test

### Step 1: Check Actual URLs on Pokengine Site

1. Go to: https://pokengine.org/collections/107s7x9x/Mongratis?icons
2. Right-click on any creature image
3. Select "Inspect" or "Inspect Element"
4. Look at the `<img>` tag's `src` attribute
5. Copy the exact URL

**What to look for:**
- What's the exact URL pattern?
- Is it `/icons/` or `/fronts/`?
- Are there any query parameters?
- Is the sprite ID format correct?

### Step 2: Test URLs in Browser

Open one of the failing URLs directly in your browser:
- `https://pokengine.b-cdn.net/play/images/mons/icons/00xjjwow.webp?t=26`

**What happens?**
- Does it load? (Then it's a CORS/code issue)
- Does it 404? (Then the URL pattern is wrong)
- Does it redirect? (Check where it redirects to)

### Step 3: Check Network Tab on Pokengine Site

1. Open DevTools → Network tab
2. Go to: https://pokengine.org/collections/107s7x9x/Mongratis?icons
3. Filter by "Img"
4. Look at the actual image requests
5. What URLs are being requested?

### Step 4: Try Different URL Patterns

The CDN might use different patterns. Try:
- `https://pokengine.b-cdn.net/play/images/mons/icons/{ID}.webp`
- `https://pokengine.b-cdn.net/images/mons/icons/{ID}.webp`
- `https://pokengine.b-cdn.net/mons/icons/{ID}.webp`
- `https://pokengine.org/play/images/mons/icons/{ID}.webp`

## Quick Test Script

Run this in browser console on the Pokengine page:

```javascript
// Get actual image URLs from the page
const images = Array.from(document.querySelectorAll('img[src*="pokengine"]'));
const urls = images.map(img => img.src).filter(url => url.includes('/mons/'));
console.log('Actual URLs on page:');
urls.slice(0, 10).forEach(url => console.log(url));
```

This will show you the exact URL pattern Pokengine uses!

