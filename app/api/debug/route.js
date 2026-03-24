// Temporary debug endpoint — shows raw Places API response
// Hit: GET /api/debug?name=A%26A+Waste+Solutions+New+Bern+NC

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bizName  = searchParams.get('name') || '';
  const placeId  = searchParams.get('placeId') || '';
  const apiKey   = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) return Response.json({ error: 'No API key' }, { status: 500 });
  if (!bizName && !placeId) return Response.json({ error: 'Pass ?name= or ?placeId=' }, { status: 400 });

  // Step 1: resolve placeId if not provided
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

  // Step 2: fetch full details
  const fields = [
    'id','displayName','businessStatus','rating','userRatingCount',
    'formattedAddress','nationalPhoneNumber','websiteUri',
    'regularOpeningHours','photos','types','primaryType',
    'editorialSummary','businessDescription','reviews',
    'googleMapsUri','primaryTypeDisplayName',
  ].join(',');

  const detailRes = await fetch(`https://places.googleapis.com/v1/${placeName}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fields,
    },
  });
  const data = await detailRes.json();

  // Return a summary so it's easy to read
  return Response.json({
    resolvedPlaceId: resolvedId,
    displayName:     data.displayName?.text,
    rating:          data.rating,
    userRatingCount: data.userRatingCount,
    photoCount:      data.photos?.length ?? 0,
    reviewCount:     data.reviews?.length ?? 0,
    hasDescription:  !!(data.editorialSummary?.text || data.businessDescription),
    editorialSummary: data.editorialSummary?.text || null,
    businessDescription: data.businessDescription || null,
    reviews:         data.reviews?.slice(0,2).map(r => ({ rating: r.rating, text: r.text?.text?.substring(0,80) })) || [],
    rawResponse:     data,
  });
}
