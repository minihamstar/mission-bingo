import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/common/Button';

interface WinnerRow {
  name: string;
  affil: string;
  last4: string;
}

type StatusKind = 'info' | 'ok' | 'err';

function maskPhone(last4: string) {
  return last4 ? `010-****-${last4}` : '–';
}

/**
 * 엑셀 시트를 2차원 배열로 읽은 뒤 "이름/소속/연락처" 열을 찾아 매핑합니다.
 * 헤더를 못 찾으면 1,2,3번째 열을 각각 이름/소속/연락처로 취급합니다.
 */
function parseAoa(aoa: unknown[][]): WinnerRow[] {
  if (!aoa.length) return [];
  const header = (aoa[0] || []).map((c) => String(c ?? '').trim());
  let nameIdx = header.findIndex((h) => /이름|성명|^name$/i.test(h));
  const affilIdx = header.findIndex((h) => /소속|회사|계열사|company|affil/i.test(h));
  const phoneIdx = header.findIndex((h) => /연락처|전화|phone|번호/i.test(h));
  const last4Idx = header.findIndex((h) => /뒷자리|뒤\s*4|last ?4/i.test(h));

  let dataRows = aoa.slice(1);
  let ai = affilIdx;
  let pi = phoneIdx;
  let li = last4Idx;
  if (nameIdx === -1) {
    nameIdx = 0;
    ai = 1;
    pi = 2;
    li = -1;
    dataRows = aoa;
  }

  const rows: WinnerRow[] = [];
  for (const r of dataRows) {
    if (!r || !r.length) continue;
    const name = String(r[nameIdx] ?? '').trim();
    if (!name) continue;
    const affil = ai >= 0 && r[ai] != null ? String(r[ai]).trim() : '';
    let last4 = '';
    if (li >= 0 && r[li] != null) {
      last4 = String(r[li]).replace(/\D/g, '').slice(-4);
    } else if (pi >= 0 && r[pi] != null) {
      last4 = String(r[pi]).replace(/\D/g, '').slice(-4);
    }
    rows.push({ name, affil, last4 });
  }
  return rows;
}

function highlight(name: string, q: string) {
  if (!q) return name;
  const idx = name.indexOf(q);
  if (idx === -1) return name;
  return (
    <>
      {name.slice(0, idx)}
      <mark>{name.slice(idx, idx + q.length)}</mark>
      {name.slice(idx + q.length)}
    </>
  );
}

export default function WinnersPage() {
  const [rows, setRows] = useState<WinnerRow[]>([]);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [query, setQuery] = useState('');

  const [adminOpen, setAdminOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingRows, setPendingRows] = useState<WinnerRow[] | null>(null);
  const [appliedInput, setAppliedInput] = useState('');
  const [fileHint, setFileHint] = useState('파일을 선택하면 아래에 미리보기가 표시됩니다.');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: StatusKind; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('event_winners_data')
        .select('rows, total_applicants')
        .eq('id', 1)
        .single();
      if (cancelled) return;
      if (error) {
        setLoadState('error');
        return;
      }
      setRows(Array.isArray(data?.rows) ? (data!.rows as WinnerRow[]) : []);
      setTotalApplicants(typeof data?.total_applicants === 'number' ? data.total_applicants : 0);
      setLoadState('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const q = query.trim().normalize('NFC');
  const filtered = useMemo(() => {
    if (!q) return rows;
    return rows.filter((w) => w.name.includes(q));
  }, [rows, q]);

  function openAdmin() {
    setAdminOpen((v) => {
      const next = !v;
      if (next) setAppliedInput(String(totalApplicants || ''));
      return next;
    });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPendingRows(null);
    setStatus(null);
    if (!file) return;
    setFileHint('분석 중…');
    try {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as unknown[][];
      const parsed = parseAoa(aoa);
      if (!parsed.length) {
        setFileHint('인식된 행이 없습니다. 첫 행에 "이름" 열이 있는지 확인해 주세요.');
        return;
      }
      setPendingRows(parsed);
      setFileHint(`${file.name} · ${parsed.length}행 인식됨`);
    } catch {
      setFileHint('파일을 읽을 수 없습니다. 엑셀(.xlsx) 또는 CSV 파일인지 확인해 주세요.');
    }
  }

  async function handleSave() {
    if (!pendingRows) return;
    setSaving(true);
    setStatus({ kind: 'info', text: '저장 중…' });
    try {
      const applied = parseInt(appliedInput, 10);
      const res = await fetch('/api/winners-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          rows: pendingRows,
          totalApplicants: Number.isFinite(applied) ? applied : pendingRows.length,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const text =
          data.error === 'invalid_password'
            ? '비밀번호가 올바르지 않습니다.'
            : data.message || '저장 중 오류가 발생했습니다.';
        setStatus({ kind: 'err', text });
        return;
      }
      setRows(pendingRows);
      setTotalApplicants(Number.isFinite(applied) ? applied : pendingRows.length);
      setStatus({ kind: 'ok', text: '저장되었습니다. 조회 화면에 바로 반영됩니다.' });
      setPendingRows(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setStatus({ kind: 'err', text: '네트워크 오류로 저장하지 못했습니다. 다시 시도해 주세요.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="winners-page">
      <div className="winners-wrap">
        <div className="winners-head-row">
          <div>
            <div className="winners-eyebrow">2026 ITCEN 구성원 AI 활용 진단 · 참여 EVENT</div>
            <h1 className="winners-title">
              {rows.length ? `당첨자 ${rows.length}명, 이름으로 찾아보세요` : '당첨자 명단, 이름으로 찾아보세요'}
            </h1>
            <p className="winners-sub">
              진단 설문에 참여해 주신 분들 중 추첨을 통해 당첨자를 선정했습니다. 아래 검색창에 이름을 입력하면
              당첨 여부를 바로 확인할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            className="winners-gear-btn"
            aria-pressed={adminOpen}
            aria-label="관리자 모드 열기"
            title="관리자 모드"
            onClick={openAdmin}
          >
            ⚙
          </button>
        </div>

        <div className="winners-stats">
          <div className="winners-stat-pill">
            <b className="mono">{totalApplicants || '–'}</b>
            <span>명 응모</span>
          </div>
          <div className="winners-stat-pill">
            <b className="mono" style={{ color: 'var(--color-primary)' }}>
              {rows.length}
            </b>
            <span>명 당첨</span>
          </div>
        </div>

        <div className="winners-search-card">
          <div className="winners-search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              className="winners-search-input"
              type="text"
              inputMode="search"
              autoComplete="off"
              placeholder="이름을 입력해 보세요 (예: 홍길동)"
              aria-label="당첨자 이름 검색"
              disabled={rows.length === 0}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="winners-clear-btn"
                onClick={() => setQuery('')}
              >
                지우기
              </button>
            )}
          </div>
          <div className="winners-result-line">
            {loadState === 'loading' && '명단을 불러오는 중입니다…'}
            {loadState === 'error' && '명단을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.'}
            {loadState === 'ready' && rows.length === 0 && '등록된 명단이 없습니다.'}
            {loadState === 'ready' && rows.length > 0 && q === '' && (
              <>
                전체 <b>{rows.length}</b>명이 표시되고 있습니다. 이름을 입력하면 좁혀집니다.
              </>
            )}
            {loadState === 'ready' && rows.length > 0 && q !== '' && filtered.length === 0 && (
              <>'{q}' 님은 당첨자 명단에 없습니다.</>
            )}
            {loadState === 'ready' && rows.length > 0 && q !== '' && filtered.length > 0 && (
              <>
                '{q}' 검색 결과 <b style={{ color: 'var(--color-primary)' }}>{filtered.length}명</b> 당첨 확인!
              </>
            )}
          </div>
        </div>

        <div className="winners-list-card">
          <div className="winners-list-head">
            <span>이름</span>
            <span>소속</span>
            <span>연락처</span>
          </div>
          <div className="winners-list-body">
            {filtered.map((w, i) => (
              <div className="winners-row" key={`${w.name}-${i}`}>
                <span className="winners-name">{highlight(w.name, q)}</span>
                <span className="winners-affil">{w.affil}</span>
                <span className="winners-phone mono">{maskPhone(w.last4)}</span>
              </div>
            ))}
          </div>
          {rows.length === 0 && loadState === 'ready' && (
            <div className="winners-empty">
              아직 등록된 당첨자 명단이 없습니다. 관리자가 엑셀을 업로드하면 이곳에 표시됩니다.
            </div>
          )}
          {rows.length > 0 && filtered.length === 0 && (
            <div className="winners-empty">일치하는 이름이 없습니다. 오탈자가 없는지 확인해 주세요.</div>
          )}
        </div>

        {adminOpen && (
          <div className="winners-admin-card">
            <h2>관리자 모드 · 명단 업로드</h2>
            <p className="winners-desc">
              엑셀(.xlsx, .csv) 파일에 <b>이름 / 소속 / 연락처</b> 열이 있으면 자동으로 인식합니다. 연락처는 뒤
              4자리만 저장되고 전체 번호는 저장되지 않습니다.
            </p>

            <div className="winners-field">
              <label htmlFor="winnersFile">당첨자 명단 엑셀 파일</label>
              <div className="winners-file-drop">
                <input id="winnersFile" type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} onChange={handleFileChange} />
                <span className="winners-preview-note">{fileHint}</span>
              </div>
            </div>

            {pendingRows && (
              <div>
                <div className="winners-preview-table">
                  <table>
                    <thead>
                      <tr>
                        <th>이름</th>
                        <th>소속</th>
                        <th>연락처(뒤4자리)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRows.slice(0, 5).map((w, i) => (
                        <tr key={i}>
                          <td>{w.name}</td>
                          <td>{w.affil}</td>
                          <td className="mono">{w.last4 || '–'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="winners-preview-note">
                  미리보기 (전체 {pendingRows.length}행 중 최대 5행 표시)
                </p>
              </div>
            )}

            <div className="winners-field">
              <label htmlFor="winnersApplied">총 응모 인원</label>
              <input
                id="winnersApplied"
                className="winners-num-input mono"
                type="number"
                min={0}
                inputMode="numeric"
                value={appliedInput}
                onChange={(e) => setAppliedInput(e.target.value)}
              />
            </div>

            <div className="winners-field">
              <label htmlFor="winnersPassword">관리자 비밀번호</label>
              <input
                id="winnersPassword"
                className="winners-text-input"
                type="password"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="button"
              className="winners-save-button"
              disabled={!pendingRows || !password || saving}
              onClick={handleSave}
            >
              {saving ? '저장 중…' : '명단 저장'}
            </Button>

            {status && <div className={`winners-status-msg ${status.kind}`}>{status.text}</div>}
          </div>
        )}

        <div className="winners-note">
          본 명단은 이벤트 응모자 중 전화번호 뒤 4자리로 본인 여부를 확인할 수 있도록 제공됩니다. 개인정보 보호를
          위해 목록 화면 캡처 및 외부 공유는 자제해 주세요. 문의사항은 Group HR로 연락 바랍니다.
        </div>
      </div>
    </div>
  );
}
