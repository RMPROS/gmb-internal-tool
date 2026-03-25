import { runAudit, sendAuditEmail } from '../../../lib/audit.js';

export const maxDuration = 90;

export async function POST(request) {
  try {
    const { bizName, placeId, gmbUrl, sendEmail, emailTo, emailName } = await request.json();

    if (!bizName) return Response.json({ error: 'bizName required' }, { status: 400 });

    // Run the audit
    const auditData = await runAudit(bizName, placeId);

    // Optionally send email
    if (sendEmail && emailTo) {
      await sendAuditEmail(emailTo, emailName || bizName, bizName, auditData);
    }

    // Log to Monday.com
    try {
      const BOARD_ID = process.env.MONDAY_BOARD_ID;
      const cols = {
        [process.env.MONDAY_COL_CONTACT_NAME]: emailName || 'Internal Run',
        [process.env.MONDAY_COL_EMAIL]:        { email: emailTo || '', text: emailTo || '' },
        [process.env.MONDAY_COL_GMB_URL]:      gmbUrl || '',
        [process.env.MONDAY_COL_SCORE]:        auditData.overallScore,
        [process.env.MONDAY_COL_STATUS]:       { label: sendEmail && emailTo ? 'Sent' : 'Internal' },
        [process.env.MONDAY_COL_SOURCE]:       'Internal Tool',
      };

      await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.MONDAY_API_KEY,
          'API-Version': '2024-01',
        },
        body: JSON.stringify({
          query: `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
            create_item(board_id: $boardId, item_name: $itemName, column_values: $columnValues) { id }
          }`,
          variables: {
            boardId: BOARD_ID,
            itemName: bizName,
            columnValues: JSON.stringify(cols),
          }
        })
      });
    } catch(me) {
      console.error('[MONDAY] log error:', me.message);
      // Non-fatal — audit still returns
    }

    const cleanBizName = auditData._cleanBizName || bizName;
    delete auditData._cleanBizName;
    return Response.json({ success: true, auditData, cleanBizName });
  } catch(e) {
    console.error('[AUDIT]', e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
