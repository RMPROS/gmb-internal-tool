export async function GET() {
  try {
    const BOARD_ID = process.env.MONDAY_BOARD_ID;

    const res = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_KEY,
        'API-Version': '2024-01',
      },
      body: JSON.stringify({
        query: `query ($boardId: ID!) {
          boards(ids: [$boardId]) {
            items_page(limit: 100, query_params: { order_by: [{ column_id: "__last_updated__", direction: desc }] }) {
              items {
                id
                name
                created_at
                updated_at
                column_values {
                  id
                  text
                  value
                }
              }
            }
          }
        }`,
        variables: { boardId: BOARD_ID }
      })
    });

    const data = await res.json();
    const items = data?.data?.boards?.[0]?.items_page?.items || [];

    const COL = {
      name:   process.env.MONDAY_COL_CONTACT_NAME,
      email:  process.env.MONDAY_COL_EMAIL,
      phone:  process.env.MONDAY_COL_PHONE,
      url:    process.env.MONDAY_COL_GMB_URL,
      score:  process.env.MONDAY_COL_SCORE,
      status: process.env.MONDAY_COL_STATUS,
      source: process.env.MONDAY_COL_SOURCE,
    };

    const leads = items.map(item => {
      const cv = {};
      item.column_values.forEach(c => { cv[c.id] = c.text || ''; });
      return {
        id:          item.id,
        bizName:     item.name,
        contactName: cv[COL.name]   || '',
        email:       cv[COL.email]  || '',
        phone:       cv[COL.phone]  || '',
        gmbUrl:      cv[COL.url]    || '',
        score:       cv[COL.score]  ? parseInt(cv[COL.score]) : null,
        status:      cv[COL.status] || '',
        source:      cv[COL.source] || '',
        createdAt:   item.created_at,
        updatedAt:   item.updated_at,
      };
    });

    return Response.json({ leads });
  } catch(e) {
    console.error('[LOG]', e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
