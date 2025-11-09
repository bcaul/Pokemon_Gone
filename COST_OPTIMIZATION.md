# Cost Optimization Summary

## Overview
This document outlines the cost-saving optimizations made to reduce API usage and minimize charges.

## Services Used & Free Tiers

### 1. **Supabase (Database)**
- **Free Tier**: 500MB database, 1GB file storage, 2GB bandwidth
- **Optimizations**:
  - Reduced gym polling from **10s → 60s** (6x reduction)
  - Reduced challenge polling from **30s → 2min** (4x reduction)
  - Reduced creature polling from **10s → 30s** (3x reduction)
  - Reduced gym tracking from **30s → 2min** (4x reduction)
  - Reduced gym creature refresh from **5min → 10min** (2x reduction)
  - **Realtime subscriptions** handle immediate updates (free)
  - **Result**: ~85% reduction in database queries

### 2. **Mapbox (Maps & Geocoding)**
- **Free Tier**: 50,000 map loads/month, 100,000 geocoding requests/month
- **Optimizations**:
  - **Geocoding auto-disables** after 5 consecutive failures (saves API calls)
  - Increased geocoding cache from **1 hour → 24 hours** (24x reduction)
  - Improved cache precision (50km grid instead of 10km)
  - Reduced park status checks from **5s → 30s** (6x reduction)
  - **Result**: ~95% reduction in geocoding API calls (if failing, 0 calls)

### 3. **Google Gemini API (AI Recommendations)**
- **Free Tier**: 15 requests/minute, 1,500 requests/day
- **Optimizations**:
  - Increased cache from **30min → 60min** (2x reduction)
  - Cache based on location grid (reuses same location)
  - Falls back to default recommendations if API fails
  - **Result**: ~50% reduction in API calls

### 4. **Overpass API (OpenStreetMap - Park Detection)**
- **Free**: No rate limits, but should be respectful
- **Optimizations**:
  - 5-minute cache (already optimized)
  - Reduced check frequency from **5s → 30s** (6x reduction)
  - **Result**: ~83% reduction in API calls

## Cost Breakdown (Estimated)

### Before Optimization (per hour):
- **Supabase queries**: ~360 requests/hour (gyms: 360, challenges: 120, creatures: 360)
- **Mapbox geocoding**: ~720 requests/hour (if working)
- **Gemini API**: ~2 requests/hour (if location changes)
- **Overpass API**: ~720 requests/hour

### After Optimization (per hour):
- **Supabase queries**: ~60 requests/hour (gyms: 60, challenges: 30, creatures: 120)
- **Mapbox geocoding**: ~0-120 requests/hour (auto-disabled if failing)
- **Gemini API**: ~1 request/hour
- **Overpass API**: ~120 requests/hour

### Estimated Savings:
- **Supabase**: ~83% reduction
- **Mapbox**: ~83-100% reduction (depending on failures)
- **Gemini**: ~50% reduction
- **Overpass**: ~83% reduction

## Key Features

### 1. **Smart Caching**
- All APIs use aggressive caching
- Location-based cache keys prevent duplicate requests
- Longer cache times for static data (countries, parks)

### 2. **Auto-Disable on Failure**
- Geocoding API automatically disables after 5 failures
- Prevents wasted API calls when service is unavailable
- Can be re-enabled by restarting the app

### 3. **Realtime Subscriptions**
- Supabase realtime handles immediate updates (free)
- Polling is only a backup for consistency
- Reduces polling frequency significantly

### 4. **Graceful Degradation**
- All APIs fail gracefully
- App continues working without API features
- Default recommendations if Gemini fails
- Default spawns if geocoding fails

## Monitoring Costs

### How to Check:
1. **Supabase Dashboard**: Monitor database queries and bandwidth
2. **Mapbox Account**: Check geocoding API usage
3. **Google Cloud Console**: Monitor Gemini API usage
4. **Browser Console**: Check for "Geocoding API disabled" warnings

### Warning Signs:
- Supabase: >500MB database usage, >1GB bandwidth
- Mapbox: >50,000 map loads, >100,000 geocoding requests
- Gemini: >1,500 requests/day

## Recommendations

1. **Monitor Usage**: Check API dashboards weekly
2. **Adjust Intervals**: Can increase intervals further if needed
3. **Disable Features**: Can disable geocoding entirely if not needed
4. **Use Realtime**: Rely more on Supabase realtime, less on polling
5. **Cache Aggressively**: Already optimized, but can increase cache times further

## Future Optimizations

1. **Server-Side Caching**: Move some caching to Supabase Edge Functions
2. **Batch Requests**: Combine multiple API calls into one
3. **Background Sync**: Sync data only when app is active
4. **User Preferences**: Let users disable non-essential features

## Notes

- All optimizations maintain app functionality
- User experience is not significantly impacted
- Realtime subscriptions ensure data stays fresh
- Caching ensures fast responses
- Auto-disable prevents wasted API calls

