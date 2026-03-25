export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!q || !apiKey) return Response.json({ predictions: [] });

  try {
    // Use Places API (New) Autocomplete
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        input: q,
        includedPrimaryTypes: ['establishment'],
      }),
    });

    const data = await res.json();
    const suggestions = (data.suggestions || []).slice(0, 6).map(s => {
      const p = s.placePrediction;
      return {
        place_id:          p.placeId,
        name:              p.structuredFormat?.mainText?.text || p.text?.text || q,
        formatted_address: p.structuredFormat?.secondaryText?.text || '',
        description:       p.text?.text || '',
      };
    });

    return Response.json({ predictions: suggestions });
  } catch(e) {
    console.error('[SEARCH]', e.message);
    return Response.json({ predictions: [] });
  }
}
