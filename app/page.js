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

// ─── Section card — matches email exactly ─────────────────────────────────────
function SectionCard({ sec }) {
  const sc = sec.score >= 75 ? G.green : sec.score >= 50 ? G.orange : G.red;
  return (
    <div style={{ border:`1.5px solid ${G.border}`, borderRadius:10, overflow:'hidden', marginBottom:16, background:'#ffffff' }}>
      <div style={{ background:'#F4F4F4', padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:18, width:30 }}>{sec.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14, color:G.navy }}>{sec.title}</div>
          <div style={{ fontSize:11, color:G.gray2, marginTop:1 }}>{sec.subtitle}</div>
        </div>
        <span style={{ background:`${sc}20`, color:sc, fontWeight:700, fontSize:12, padding:'4px 12px', borderRadius:100 }}>{sec.score}/100</span>
      </div>
      {sec.findings.map((f, i) => {
        const icon = f.status==='good' ? '✅' : f.status==='warning' ? '⚠️' : '🔴';
        const tc   = f.status==='good' ? G.green : f.status==='warning' ? G.amber : G.red;
        const bg   = f.status==='good' ? '#e8f7ed' : f.status==='warning' ? '#fff4e5' : '#fdf0ee';
        const tag  = f.status==='good' ? 'GOOD' : f.status==='warning' ? 'IMPROVE' : 'CRITICAL';
        return (
          <div key={i} style={{ padding:'12px 16px', borderTop:'1px solid #f0f0f0', display:'flex', gap:10, alignItems:'flex-start' }}>
            <span style={{ fontSize:15, flexShrink:0, marginTop:2, width:24 }}>{icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:13, color:G.navy, marginBottom:3 }}>{f.title}</div>
              <div style={{ fontSize:12, color:G.gray2, lineHeight:1.5 }}>{f.desc}</div>
            </div>
            <span style={{ background:bg, color:tc, fontSize:10, fontWeight:700, letterSpacing:.8, padding:'3px 8px', borderRadius:4, flexShrink:0, marginTop:2 }}>{tag}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Audit Result — mirrors the email report exactly ─────────────────────────
function AuditResult({ result, bizName }) {
  const gradeColor = { A:G.green, B:G.orange, C:G.amber, F:G.red }[result.grade] || G.orange;
  const bannerUrl  = 'https://gmb-drip-k4ap.vercel.app/banner.png';
  const bookingUrl = 'https://go.oncehub.com/rental-revenue-call';

  return (
    <div className="print-report" style={{ marginTop:28, maxWidth:620, marginLeft:'auto', marginRight:'auto' }}>

      {/* Print button */}
      <div className="no-print" style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
        <button onClick={() => window.print()}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 18px', background:G.navy, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          🖨️ Print Report
        </button>
      </div>

      {/* Banner image */}
      <img src={bannerUrl} alt="GMB Audit"
        style={{ width:'100%', display:'block', borderRadius:'12px 12px 0 0' }} />

      {/* Navy header — score + summary + priorities */}
      <div style={{ background:G.navy, padding:'28px 32px' }}>
        <div style={{ display:'flex', gap:24, alignItems:'flex-start' }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:18, color:'#fff', marginBottom:8 }}>{bizName}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.6 }}>{result.summary}</div>
            <div style={{ marginTop:20, borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:16 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:10 }}>Top 3 Priorities</div>
              {result.topPriorities.map((p, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, paddingBottom:10, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width:28, height:28, background:G.orange, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:12, fontWeight:700, color:'#fff' }}>{i+1}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.8)', lineHeight:1.5, paddingTop:5 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Score block */}
          <div style={{ width:130, textAlign:'center', flexShrink:0 }}>
            <div style={{ fontSize:64, fontWeight:700, color:'#fff', lineHeight:1 }}>{result.overallScore}</div>
            <div style={{ fontSize:18, color:'rgba(255,255,255,0.4)' }}>/100</div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginTop:4 }}>SCORE</div>
            <div style={{ display:'inline-block', background:`${gradeColor}30`, color:gradeColor, fontSize:13, fontWeight:700, padding:'5px 14px', borderRadius:100, marginTop:10 }}>
              {result.grade}-Grade
            </div>
          </div>
        </div>
      </div>

      {/* White section — detailed findings */}
      <div style={{ background:'#fff', padding:'32px', border:`1.5px solid ${G.border}`, borderTop:'none' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:G.gray2, marginBottom:20 }}>
          Detailed Findings
        </div>
        {result.sections.map(sec => <SectionCard key={sec.id} sec={sec} />)}

        {/* CTA block */}
        <div style={{ background:'linear-gradient(135deg,#0A2342 0%,#0d3566 100%)', borderRadius:12, marginTop:8, padding:'28px 32px', textAlign:'center' }}>
          <div style={{ fontSize:20, fontWeight:700, color:'#fff', marginBottom:8 }}>Ready to fix these issues?</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginBottom:20, lineHeight:1.6 }}>
            Our local SEO specialists have helped hundreds of businesses improve their Google ranking and get more qualified leads.
          </div>
          <a href={bookingUrl} target="_blank" rel="noreferrer"
            style={{ display:'inline-block', background:G.orange, color:'#fff', fontSize:15, fontWeight:700, padding:'14px 32px', borderRadius:8, textDecoration:'none' }}>
            📅 Book My Free Discovery Call
          </a>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:12 }}>No obligation · 15 minutes · Real recommendations</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background:'#F4F4F4', padding:'20px 32px', textAlign:'center', borderRadius:'0 0 12px 12px', border:`1.5px solid ${G.border}`, borderTop:'none' }}>
        <div style={{ fontSize:11, color:G.gray2, lineHeight:1.6 }}>
          © 2025 Rental Marketing Pros ·{' '}
          <a href="https://rentalmarketingpros.com" style={{ color:G.gray2 }}>rentalmarketingpros.com</a>
        </div>
      </div>
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
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        {[
          { label:'Total Audits',      value: leads.length },
          { label:'Emailed to Leads',  value: sentCount },
          { label:'Internal Runs',     value: internalCount },
          { label:'Avg Score',         value: avgScore != null ? `${avgScore}/100` : '—' },
        ].map(s => (
          <div key={s.label} style={{ background:'#fff', border:`1.5px solid ${G.border}`, borderRadius:10, padding:'14px 20px', flex:1, minWidth:120 }}>
            <div style={{ fontSize:22, fontWeight:800, color:G.navy }}>{s.value}</div>
            <div style={{ fontSize:11, color:G.gray2, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by business, name, email..."
          style={{ flex:1, padding:'9px 14px', border:`1.5px solid ${G.border}`, borderRadius:8, fontSize:13, outline:'none', fontFamily:'inherit' }}/>
        <button onClick={load}
          style={{ padding:'9px 16px', background:G.navy, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
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
    const bizName = p.structured_formatting?.main_text || p.description;
    setSelected({ name: bizName, placeId: p.place_id });
    setQuery(bizName);
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
      <div className="no-print">
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

      </div>{/* end no-print */}
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
        @media print {
          .no-print { display: none !important; }
          .print-report { margin: 0 !important; max-width: 100% !important; }
          body { background: white !important; }
          @page { margin: 0.5in; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ background:G.navy, padding:'0 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:56 }}>
          <div style={{ fontWeight:800, fontSize:15, color:'#fff', letterSpacing:.3 }}>
            🔍 GMB Audit — Internal Tool
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', fontWeight:600 }}>RENTAL MARKETING PROS</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{ background:'#fff', borderBottom:`2px solid ${G.border}` }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', padding:'0 24px' }}>
          {[
            { id:'run', label:'🔍 Run Audit' },
            { id:'log', label:'📋 Audit Log' },
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
