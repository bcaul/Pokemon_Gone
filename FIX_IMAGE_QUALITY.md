# Fix Image Quality/Blur Issue

## Problem
Creature sprites appear blurry when viewing in collection or catch modal.

## Solution Applied

### 1. Updated Image Rendering CSS
Changed from `pixelated` to `crisp-edges` for better pixel art rendering:
- `imageRendering: 'crisp-edges'` - Standard CSS property
- `WebkitImageRendering: 'crisp-edges'` - Safari/WebKit support
- `msImageRendering: 'crisp-edges'` - IE/Edge support

### 2. Added Hardware Acceleration
- `backfaceVisibility: 'hidden'` - Prevents flickering during transforms
- `WebkitBackfaceVisibility: 'hidden'` - Safari support

### 3. Files Updated
- `src/components/Collection.jsx` - Collection view images
- `src/components/CatchModal.jsx` - Catch modal images (both views)
- `src/components/Map.jsx` - Map marker images

## Why This Works

**Crisp-edges vs Pixelated:**
- `pixelated` - Uses nearest-neighbor scaling but can look blurry on some displays
- `crisp-edges` - Better for pixel art, maintains sharp edges when scaling

**Hardware Acceleration:**
- Using `backfaceVisibility: 'hidden'` enables GPU acceleration
- Prevents browser from applying anti-aliasing that causes blur

## Testing

After changes, check:
1. Collection view - Images should appear sharp and clear
2. Catch modal - Both preview and success views should be crisp
3. Map markers - Should remain clear (smaller size, but sharp)

## If Still Blurry

If images are still blurry, try:
1. Check if images are being scaled - Native resolution should be used
2. Verify browser zoom is at 100%
3. Check display DPI settings
4. Try using `image-rendering: auto` for high-DPI displays

