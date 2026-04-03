"use client";

import { useState, useEffect } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://jmc-backend.verycloud.io/api/v1";

const REGIONS = [
  "서울","경기","인천","부산","대구","대전","광주","울산",
  "세종","강원","충북","충남","전북","전남","경북","경남","제주",
];

const FEATURES = [
  { icon: "🛡️", title: "실명 검증", desc: "휴대폰 본인확인 + 셀피 인증으로 허위 계정을 원천 차단합니다." },
  { icon: "💎", title: "진지한 사람만", desc: "결혼 의향, 가치관, 생활 패턴까지. 깊이 있는 매칭." },
  { icon: "🤝", title: "상호 관심 후 대화", desc: "양쪽 모두 관심을 보내야 대화가 열립니다. 원치 않는 연락 제로." },
  { icon: "🎓", title: "졸업하는 앱", desc: "좋은 사람을 만나면 떠나는 게 성공. 체류가 아닌 관계가 목표." },
];

export default function Home() {
  const [form, setForm] = useState({
    name: "", phone: "", gender: "", birth_year: "", region: "", referral_source: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [regNumber, setRegNumber] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/pre_registrations/count`)
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/pre_registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pre_registration: {
            ...form,
            gender: form.gender === "male" ? 0 : form.gender === "female" ? 1 : 2,
            birth_year: form.birth_year ? parseInt(form.birth_year) : null,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setRegNumber(data.registration_number);
      } else {
        setError(data.errors?.join(", ") || "등록에 실패했습니다.");
      }
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = Math.max(1000 - count, 0);

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-3">사전등록 완료!</h2>
          <p className="text-zinc-500 text-lg mb-6">{regNumber}번째로 등록하셨습니다.</p>
          <div className="bg-zinc-50 rounded-2xl p-6 text-sm text-zinc-600">
            앱 출시 시 등록하신 번호로 알림을 보내드립니다.
            <br />
            <strong className="text-zinc-900">첫 1,000명</strong>은 무료로 이용할 수 있습니다.
          </div>
          <p className="mt-8 text-sm text-zinc-400">
            남은 무료 자리: <strong className="text-zinc-700">{Math.max(1000 - regNumber, 0)}석</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.15)_0%,_transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto px-4 pt-24 pb-20 text-center">
          {count > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-300 mb-10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              사전등록 진행 중
              <span className="text-emerald-400 font-semibold">{count}명</span>
              <span className="text-zinc-500">/ 1,000명</span>
            </div>
          )}

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
            진만추
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-400 mb-3 font-medium">
            진지한 만남 추구
          </p>
          <p className="text-base sm:text-lg text-zinc-500 max-w-md mx-auto leading-relaxed mb-10">
            소모적인 연애는 그만.
            <br />
            검증된 사람과 안전하게, 진지하게.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#register" className="inline-flex items-center justify-center rounded-xl bg-white text-zinc-900 px-8 py-4 text-base font-bold hover:bg-zinc-100 transition shadow-lg shadow-white/10">
              무료 사전등록
            </a>
            {remaining < 1000 && (
              <span className="text-sm text-zinc-500">
                남은 자리 <span className="text-emerald-400 font-semibold">{remaining}석</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-b border-zinc-100 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center gap-8 text-sm text-zinc-400">
          <span>결혼정보회사급 <strong className="text-zinc-700">신뢰</strong></span>
          <span className="w-1 h-1 rounded-full bg-zinc-300" />
          <span>SNS급 <strong className="text-zinc-700">자연스러움</strong></span>
          <span className="w-1 h-1 rounded-full bg-zinc-300" />
          <span>앱급 <strong className="text-zinc-700">접근성</strong></span>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 text-center mb-12">
          왜 진만추인가?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-100 bg-white p-6 hover:border-zinc-200 hover:shadow-sm transition">
              <div className="text-2xl mb-3">{f.icon}</div>
              <div className="text-lg font-semibold text-zinc-900 mb-2">{f.title}</div>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-zinc-950 text-white p-8 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-8 text-center">기존 서비스와의 차이</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="text-center opacity-60">
              <div className="text-zinc-500 mb-2 text-xs uppercase tracking-wider">결혼정보회사</div>
              <div className="font-medium text-base">수백만원 비용</div>
              <div className="text-zinc-500 mt-1">매니저 역량에 의존</div>
            </div>
            <div className="text-center sm:border-x sm:border-zinc-800 sm:px-6">
              <div className="text-emerald-400 mb-2 text-xs uppercase tracking-wider font-bold">진만추</div>
              <div className="font-bold text-lg">검증 + 자연스러움</div>
              <div className="text-zinc-400 mt-1">합리적 비용, 내 일상으로 어필</div>
            </div>
            <div className="text-center opacity-60">
              <div className="text-zinc-500 mb-2 text-xs uppercase tracking-wider">소개팅 앱</div>
              <div className="font-medium text-base">신뢰 부족</div>
              <div className="text-zinc-500 mt-1">허위 계정, 가벼운 만남</div>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="register" className="bg-zinc-50 py-16 sm:py-20">
        <div className="max-w-lg mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-3">
              사전등록
            </h2>
            <p className="text-zinc-500">
              첫 1,000명은 무료로 이용할 수 있습니다.
            </p>
            {count > 0 && (
              <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-white border border-zinc-200 px-5 py-2">
                <span className="text-sm text-zinc-500">{count}명 등록</span>
                <div className="w-24 bg-zinc-200 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((count / 1000) * 100, 100)}%` }} />
                </div>
                <span className="text-sm font-semibold text-emerald-600">{remaining}석 남음</span>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-4 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">이름 <span className="text-red-500">*</span></label>
              <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition" placeholder="홍길동" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">휴대폰 번호 <span className="text-red-500">*</span></label>
              <input type="tel" required maxLength={11} value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition" placeholder="01012345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">성별</label>
              <div className="flex gap-2">
                {[{ value: "male", label: "남성" }, { value: "female", label: "여성" }].map((g) => (
                  <button key={g.value} type="button" onClick={() => setForm((p) => ({ ...p, gender: g.value }))}
                    className={`flex-1 rounded-xl border py-3 text-sm font-medium transition ${form.gender === g.value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">출생연도</label>
                <input type="number" min={1970} max={2005} value={form.birth_year}
                  onChange={(e) => setForm((p) => ({ ...p, birth_year: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition" placeholder="1995" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">지역</label>
                <select value={form.region} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition bg-white">
                  <option value="">선택</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">어떻게 알게 되셨나요?</label>
              <select value={form.referral_source} onChange={(e) => setForm((p) => ({ ...p, referral_source: e.target.value }))}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition bg-white">
                <option value="">선택</option>
                <option value="search">검색 (네이버/구글)</option>
                <option value="sns">SNS (인스타/페이스북)</option>
                <option value="community">커뮤니티 (에브리타임/블라인드 등)</option>
                <option value="friend">지인 소개</option>
                <option value="other">기타</option>
              </select>
            </div>
            <button type="submit" disabled={submitting || !form.name || !form.phone}
              className="w-full rounded-xl bg-zinc-900 text-white py-3.5 text-sm font-bold hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition">
              {submitting ? "등록 중..." : "무료 사전등록"}
            </button>
            <p className="text-xs text-zinc-400 text-center">등록하신 정보는 서비스 출시 알림 목적으로만 사용됩니다.</p>
          </form>
        </div>
      </section>

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        <p>진만추 (진지한 만남 추구)</p>
      </footer>
    </div>
  );
}
