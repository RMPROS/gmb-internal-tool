export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!q || !apiKey) return Response.json({ predictions: [] });

  const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json'
    + '?input=' + encodeURIComponent(q)
    + '&types=establishment'
    + '&key=' + apiKey;

  try {
    const r = await fetch(url);
    const d = await r.json();
    return Response.json({ predictions: d.predictions || [] });
  } catch(e) {
    return Response.json({ predictions: [] });
  }
}
