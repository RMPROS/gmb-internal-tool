// Debug endpoint — shows raw Places API response AND the exact string sent to Claude
// GET /api/debug?name=A%26A+Waste+Solutions+New+Bern+NC

import { formatPlacesDataForDebug } from '../../../lib/audit.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bizName  = searchParams.get('name') || '';
  const placeId  = searchParams.get('placeId') || '';
  const apiKey   = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) return Response.json({ error: 'No API key' }, { status: 500 });
  if (!bizName && !placeId) return Response.json({ error: 'Pass ?name= or ?placeId=' }, { status: 400 });

  // Resolve placeId
  let resolvedId = placeId;
  if (!resolvedId) {
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName',
      },
      body: JSON.stringify({ textQuery: bizName }),
    });
    const searchData = await searchRes.json();
    resolvedId = searchData.places?.[0]?.id || null;
    if (!resolvedId) return Response.json({ error: 'Business not found', searchData }, { status: 404 });
  }

  const placeName = resolvedId.startsWith('places/') ? resolvedId : 'places/' + resolvedId;

  const fields = [
    'id','displayName','businessStatus','rating','userRatingCount',
    'formattedAddress','nationalPhoneNumber','internationalPhoneNumber',
    'websiteUri','regularOpeningHours','photos','types','primaryType',
    'editorialSummary','reviews','priceLevel',
    'currentOpeningHours','regularSecondaryOpeningHours','googleMapsUri','primaryTypeDisplayName',
  ].join(',');

  const detailRes = await fetch(`https://places.googleapis.com/v1/${placeName}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fields,
    },
  });
  const data = await detailRes.json();

  // Format the data block exactly as Claude sees it
  const claudeDataBlock = formatPlacesDataForDebug(data);

  return Response.json({
    resolvedPlaceId: resolvedId,
    apiError:        data.error || null,
    summary: {
      displayName:     data.displayName?.text,
      rating:          data.rating,
      userRatingCount: data.userRatingCount,
      photoCount:      data.photos?.length ?? 0,
      reviewCount:     data.reviews?.length ?? 0,
      hasEditorialSummary: !!data.editorialSummary?.text,
    },
    claudeDataBlock,   // <-- exactly what Claude receives
    rawResponse: data,
  });
}
