'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const G = {
  navy:    '#0A2342',
  orange:  '#FF8C00',
  green:   '#1a8a4a',
  red:     '#c0392b',
  amber:   '#b86200',
  gray1:   '#f4f4f6',
  gray2:   '#A1A0A5',
  border:  '#e0e0e2',
};

const PASS = process.env.NEXT_PUBLIC_INTERNAL_PASSWORD || 'rmp2025';

// ─── Score ring ──────────────────────────────────────────────────────────────
function ScoreRing({ score, grade }) {
  const color = score >= 75 ? G.green : score >= 50 ? G.orange : G.red;
  const r = 44, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ textAlign:'center' }}>
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={r} fill="none" stroke="#e8e8ec" strokeWidth={8}/>
        <circle cx={55} cy={55} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 55 55)" style={{ transition:'stroke-dasharray .6s ease' }}/>
        <text x={55} y={50} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize:22, fontWeight:800, fill:G.navy }}>{score}</text>
        <text x={55} y={68} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize:13, fontWeight:700, fill:color }}>{grade}-Grade</text>
      </svg>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ sec }) {
  const sc = sec.score >= 75 ? G.green : sec.score >= 50 ? G.orange : G.red;
  return (
    <div style={{ border:`1.5px solid ${G.border}`, borderRadius:10, overflow:'hidden', marginBottom:12, background:'#fff' }}>
      <div style={{ background:G.gray1, padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:18 }}>{sec.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:13, color:G.navy }}>{sec.title}</div>
          <div style={{ fontSize:11, color:G.gray2 }}>{sec.subtitle}</div>
        </div>
        <span style={{ background:`${sc}18`, color:sc, fontWeight:700, fontSize:12, padding:'3px 10px', borderRadius:100 }}>{sec.score}/100</span>
      </div>
      {sec.findings.map((f, i) => {
        const icon = f.status==='good' ? '✅' : f.status==='warning' ? '⚠️' : '🔴';
        const tc   = f.status==='good' ? G.green : f.status==='warning' ? G.amber : G.red;
        const bg   = f.status==='good' ? '#e8f7ed' : f.status==='warning' ? '#fff4e5' : '#fdf0ee';
        const tag  = f.status==='good' ? 'GOOD' : f.status==='warning' ? 'IMPROVE' : 'CRITICAL';
        return (
          <div key={i} style={{ padding:'11px 16px', borderTop:`1px solid ${G.border}`, display:'flex', gap:10, alignItems:'flex-start' }}>
            <span style={{ fontSize:15, flexShrink:0, marginTop:1 }}>{icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:12.5, color:G.navy, marginBottom:2 }}>{f.title}</div>
              <div style={{ fontSize:11.5, color:G.gray2, lineHeight:1.5 }}>{f.desc}</div>
            </div>
            <span style={{ background:bg, color:tc, fontSize:10, fontWeight:700, letterSpacing:.8, padding:'2px 7px', borderRadius:4, flexShrink:0, marginTop:2 }}>{tag}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Audit Result Panel ───────────────────────────────────────────────────────
function AuditResult({ result, bizName }) {
  return (
    <div style={{ marginTop:24 }}>
      <div style={{ background:G.navy, borderRadius:12, padding:'24px 28px', marginBottom:20, display:'flex', gap:24, alignItems:'flex-start' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800, fontSize:17, color:'#fff', marginBottom:6 }}>{bizName}</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.65)', lineHeight:1.6, marginBottom:16 }}>{result.summary}</div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,.1)', paddingTop:14 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'rgba(255,255,255,.4)', marginBottom:10 }}>Top Priorities</div>
            {result.topPriorities.map((p, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
                <div style={{ width:22, height:22, background:G.orange, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:700, color:'#fff' }}>{i+1}</div>
                <div style={{ fontSize:12.5, color:'rgba(255,255,255,.75)', lineHeight:1.5 }}>{p}</div>
              </div>
            ))}
          </div>
        </div>
        <ScoreRing score={result.overallScore} grade={result.grade} />
      </div>
      {result.sections.map(sec => <SectionCard key={sec.id} sec={sec} />)}
    </div>
  );
}

// ─── Grade badge ──────────────────────────────────────────────────────────────
function GradeBadge({ grade, score }) {
  if (!grade && score == null) return <span style={{ color:G.gray2, fontSize:12 }}>—</span>;
  const color = score >= 75 ? G.green : score >= 50 ? G.orange : G.red;
  return (
    <span style={{ background:`${color}18`, color, fontWeight:700, fontSize:12, padding:'2px 9px', borderRadius:100 }}>
      {grade && `${grade} · `}{score != null && `${score}/100`}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Sent:     { bg:'#e8f7ed', color:G.green },
    Internal: { bg:'#eff3ff', color:'#3b5bdb' },
    Pending:  { bg:'#fff4e5', color:G.amber },
    Error:    { bg:'#fdf0ee', color:G.red },
  };
  const s = map[status] || { bg:G.gray1, color:G.gray2 };
  return (
    <span style={{ background:s.bg, color:s.color, fontWeight:700, fontSize:11, padding:'2px 9px', borderRadius:100 }}>
      {status || 'Unknown'}
    </span>
  );
}

// ─── Audit Log Tab ────────────────────────────────────────────────────────────
function AuditLog() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const r = await fetch('/api/log');
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setLeads(d.leads || []);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = leads.filter(l =>
    !search || [l.bizName, l.contactName, l.email, l.phone, l.source].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const sentCount     = leads.filter(l => l.status === 'Sent').length;
  const internalCount = leads.filter(l => l.status === 'Internal').length;
  const avgScore      = leads.filter(l => l.score != null).length
    ? Math.round(leads.filter(l => l.score != null).reduce((a, l) => a + l.score, 0) / leads.filter(l => l.score != null).length)
    : null;

  return (
    <div>
      {/* Stats row */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        {[
          { label:'Total Audits', value: leads.length },
          { label:'Emailed to Leads', value: sentCount },
          { label:'Internal Runs', value: internalCount },
          { label:'Avg Score', value: avgScore != null ? `${avgScore}/100` : '—' },
        ].map(s => (
          <div key={s.label} style={{ background:'#fff', border:`1.5px solid ${G.border}`, borderRadius:10, padding:'14px 20px', flex:1, minWidth:120 }}>
            <div style={{ fontSize:22, fontWeight:800, color:G.navy }}>{s.value}</div>
            <div style={{ fontSize:11, color:G.gray2, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + refresh */}
      <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by business, name, email..."
          style={{ flex:1, padding:'9px 14px', border:`1.5px solid ${G.border}`, borderRadius:8, fontSize:13, outline:'none', fontFamily:'inherit' }}
        />
        <button onClick={load} style={{ padding:'9px 16px', background:G.navy, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          ↻ Refresh
        </button>
      </div>

      {err && <div style={{ background:'#fdf0ee', border:`1.5px solid #fecaca`, borderRadius:8, padding:'10px 14px', fontSize:13, color:G.red, marginBottom:14 }}>{err}</div>}

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:G.gray2, fontSize:14 }}>Loading audit log...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:G.gray2, fontSize:14 }}>No audits found{search ? ' for that search' : ''}.</div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
            <thead>
              <tr style={{ background:G.gray1 }}>
                {['Business','Contact','Email','Phone','Score','Status','Source','Date'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:700, color:G.navy, fontSize:11, letterSpacing:.5, textTransform:'uppercase', borderBottom:`2px solid ${G.border}`, whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr key={l.id} style={{ background: i%2===0 ? '#fff' : '#fafafa', borderBottom:`1px solid ${G.border}` }}>
                  <td style={{ padding:'11px 12px', fontWeight:600, color:G.navy, maxWidth:180 }}>
                    {l.gmbUrl
                      ? <a href={l.gmbUrl} target="_blank" rel="noreferrer" style={{ color:G.navy, textDecoration:'none' }}>{l.bizName} ↗</a>
                      : l.bizName}
                  </td>
                  <td style={{ padding:'11px 12px', color:'#444' }}>{l.contactName || '—'}</td>
                  <td style={{ padding:'11px 12px', color:'#444' }}>
                    {l.email ? <a href={`mailto:${l.email}`} style={{ color:G.navy }}>{l.email}</a> : '—'}
                  </td>
                  <td style={{ padding:'11px 12px', color:'#444', whiteSpace:'nowrap' }}>{l.phone || '—'}</td>
                  <td style={{ padding:'11px 12px' }}><GradeBadge score={l.score} /></td>
                  <td style={{ padding:'11px 12px' }}><StatusBadge status={l.status} /></td>
                  <td style={{ padding:'11px 12px', color:G.gray2, fontSize:11.5 }}>{l.source || '—'}</td>
                  <td style={{ padding:'11px 12px', color:G.gray2, fontSize:11.5, whiteSpace:'nowrap' }}>
                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Run Audit Tab ────────────────────────────────────────────────────────────
function RunAudit() {
  const [query, setQuery]         = useState('');
  const [preds, setPreds]         = useState([]);
  const [selected, setSelected]   = useState(null);
  const [showPreds, setShowPreds] = useState(false);
  const debounce                  = useRef(null);

  const [email, setEmail]         = useState('');
  const [emailName, setEmailName] = useState('');
  const [doEmail, setDoEmail]     = useState(false);

  const [running, setRunning]     = useState(false);
  const [result, setResult]       = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [err, setErr]             = useState('');

  const onSearch = (v) => {
    setQuery(v); setSelected(null); setResult(null);
    clearTimeout(debounce.current);
    if (v.length < 2) { setPreds([]); return; }
    debounce.current = setTimeout(async () => {
      const r = await fetch('/api/search?q=' + encodeURIComponent(v));
      const d = await r.json();
      setPreds(d.predictions || []);
      setShowPreds(true);
    }, 280);
  };

  const pick = (p) => {
    setSelected({ name: p.description, placeId: p.place_id });
    setQuery(p.description);
    setPreds([]); setShowPreds(false);
    setResult(null);
  };

  const runIt = async () => {
    const bizName = selected?.name || query.trim();
    if (!bizName) return;
    if (doEmail && !email) { setErr('Enter an email address to send the report.'); return; }
    setRunning(true); setErr(''); setResult(null); setEmailSent(false);

    try {
      const r = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          bizName, placeId: selected?.placeId,
          gmbUrl: selected?.placeId
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bizName)}&query_place_id=${selected.placeId}`
            : '',
          sendEmail: doEmail, emailTo: email, emailName,
        })
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || 'Audit failed');
      setResult(d.auditData);
      if (doEmail && email) setEmailSent(true);
    } catch(e) { setErr(e.message); }
    finally { setRunning(false); }
  };

  return (
    <div>
      {/* Business search */}
      <div style={{ marginBottom:16, position:'relative' }}>
        <label style={{ display:'block', fontSize:12, fontWeight:700, color:G.navy, marginBottom:6, letterSpacing:.5, textTransform:'uppercase' }}>Business Name</label>
        <input
          value={query} onChange={e => onSearch(e.target.value)}
          onFocus={() => preds.length && setShowPreds(true)}
          placeholder="Search for any business on Google..."
          style={{ width:'100%', padding:'11px 14px', border:`1.5px solid ${G.border}`, borderRadius:9, fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
        />
        {showPreds && preds.length > 0 && (
          <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', border:`1.5px solid ${G.border}`, borderRadius:9, zIndex:100, boxShadow:'0 8px 24px rgba(0,0,0,.1)', marginTop:4, maxHeight:220, overflowY:'auto' }}>
            {preds.map(p => (
              <div key={p.place_id} onClick={() => pick(p)}
                style={{ padding:'10px 14px', cursor:'pointer', borderBottom:`1px solid ${G.border}`, fontSize:13 }}
                onMouseEnter={e => e.currentTarget.style.background=G.gray1}
                onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                <div style={{ fontWeight:600, color:G.navy }}>{p.structured_formatting?.main_text || p.description}</div>
                <div style={{ fontSize:11.5, color:G.gray2 }}>{p.structured_formatting?.secondary_text || ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send email toggle */}
      <div style={{ background:G.gray1, border:`1.5px solid ${G.border}`, borderRadius:9, padding:'14px 16px', marginBottom:16 }}>
        <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <input type="checkbox" checked={doEmail} onChange={e => setDoEmail(e.target.checked)}
            style={{ width:16, height:16, accentColor:G.orange, cursor:'pointer' }}/>
          <span style={{ fontSize:13, fontWeight:600, color:G.navy }}>Also send audit email to a prospect</span>
        </label>
        {doEmail && (
          <div style={{ marginTop:12, display:'flex', gap:10, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:160 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:G.gray2, marginBottom:4, textTransform:'uppercase', letterSpacing:.5 }}>Recipient Name</label>
              <input value={emailName} onChange={e => setEmailName(e.target.value)} placeholder="First Last"
                style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${G.border}`, borderRadius:7, fontSize:13, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
            </div>
            <div style={{ flex:2, minWidth:200 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:G.gray2, marginBottom:4, textTransform:'uppercase', letterSpacing:.5 }}>Email Address <span style={{ color:G.red }}>*</span></label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="prospect@example.com"
                style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${G.border}`, borderRadius:7, fontSize:13, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
            </div>
          </div>
        )}
      </div>

      {err && <div style={{ background:'#fdf0ee', border:`1.5px solid #fecaca`, borderRadius:8, padding:'10px 14px', fontSize:13, color:G.red, marginBottom:14 }}>{err}</div>}

      {emailSent && (
        <div style={{ background:'#e8f7ed', border:`1.5px solid #a7d7b8`, borderRadius:8, padding:'10px 14px', fontSize:13, color:G.green, marginBottom:14 }}>
          ✅ Audit report emailed to {email}
        </div>
      )}

      <button onClick={runIt} disabled={running || (!query.trim())}
        style={{ width:'100%', padding:'13px 20px', background: running ? G.gray2 : G.orange, color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:800, cursor: running ? 'not-allowed' : 'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background .2s' }}>
        {running
          ? <><div style={{ width:16, height:16, border:'2.5px solid rgba(255,255,255,.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }}/> Running Audit...</>
          : '🔍 Run GMB Audit'}
      </button>

      {result && <AuditResult result={result} bizName={selected?.name || query} />}
    </div>
  );
}

// ─── Password gate ────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const submit = () => {
    if (pw === PASS) onUnlock();
    else { setErr(true); setPw(''); setTimeout(() => setErr(false), 2000); }
  };
  return (
    <div style={{ minHeight:'100vh', background:G.navy, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:40, width:'100%', maxWidth:360, textAlign:'center', boxShadow:'0 24px 60px rgba(0,0,0,.3)' }}>
        <div style={{ fontSize:36, marginBottom:12 }}>🔒</div>
        <div style={{ fontSize:20, fontWeight:800, color:G.navy, marginBottom:6 }}>Internal Tool</div>
        <div style={{ fontSize:13, color:G.gray2, marginBottom:24 }}>Rental Marketing Pros — GMB Audit</div>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key==='Enter' && submit()}
          placeholder="Enter password"
          style={{ width:'100%', padding:'12px 16px', border:`2px solid ${err ? G.red : G.border}`, borderRadius:9, fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box', textAlign:'center', marginBottom:12 }}/>
        {err && <div style={{ color:G.red, fontSize:13, marginBottom:10 }}>Incorrect password</div>}
        <button onClick={submit}
          style={{ width:'100%', padding:'12px', background:G.orange, color:'#fff', border:'none', borderRadius:9, fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>
          Unlock
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab]           = useState('run');

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { background: ${G.gray1}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ background:G.navy, padding:'0 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:56 }}>
          <div style={{ fontWeight:800, fontSize:15, color:'#fff', letterSpacing:.3 }}>
            🔍 GMB Audit — Internal Tool
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', fontWeight:600 }}>RENTAL MARKETING PROS</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:'#fff', borderBottom:`2px solid ${G.border}` }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', padding:'0 24px' }}>
          {[
            { id:'run',  label:'🔍 Run Audit' },
            { id:'log',  label:'📋 Audit Log' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:'14px 20px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit',
                color: tab===t.id ? G.orange : G.gray2,
                borderBottom: tab===t.id ? `3px solid ${G.orange}` : '3px solid transparent',
                marginBottom:-2 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 24px' }}>
        {tab === 'run' && <RunAudit />}
        {tab === 'log' && <AuditLog />}
      </div>
    </>
  );
}
