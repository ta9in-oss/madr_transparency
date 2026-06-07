import { useState } from "react";

// ─── CLEANED DATA ──────────────────────────────────────────────────────────────

const SEEDS_BY_ORIGIN = [
  { country: "الصين", count: 572, flag: "🇨🇳" },
  { country: "إيطاليا", count: 480, flag: "🇮🇹" },
  { country: "الهند", count: 404, flag: "🇮🇳" },
  { country: "تايلاند", count: 358, flag: "🇹🇭" },
  { country: "الولايات المتحدة", count: 340, flag: "🇺🇸" },
  { country: "كوستاريكا", count: 323, flag: "🇨🇷" },
  { country: "بيرو", count: 244, flag: "🇵🇪" },
  { country: "تركيا", count: 222, flag: "🇹🇷" },
  { country: "فرنسا", count: 187, flag: "🇫🇷" },
  { country: "تشيلي", count: 165, flag: "🇨🇱" },
];

// Raw categories from the site (messy), mapped to clean groups
const CHEMICALS_CLEAN = [
  { label: "مُصحح نقص معادن", labelFr: "Correcteur de carence", count: 842, color: "#e8a838" },
  { label: "مبيد فطري", labelFr: "Fongicide", count: 772, color: "#6ab04c" },
  { label: "منشط نمو بيولوجي", labelFr: "Biostimulant", count: 704, color: "#22a6b3" },
  { label: "مبيد حشري", labelFr: "Insecticide", count: 560, color: "#e84393" },
  { label: "منظم نمو", labelFr: "Régulateur de croissance", count: 546, color: "#a29bfe" },
  { label: "سماد", labelFr: "Engrais / Fertilisant", count: 146, color: "#fd9644" },
  { label: "مبيد أعشاب", labelFr: "Herbicide", count: 192, color: "#26de81" },
  { label: "مبيد عناكبي", labelFr: "Acaricide", count: 99, color: "#fc5c65" },
  { label: "مبيد نيماتودا", labelFr: "Nématicide", count: 36, color: "#45aaf2" },
  { label: "أخرى", labelFr: "Autres", count: 161, color: "#778ca3" },
];

const CHEMICALS_BY_ORIGIN = [
  { country: "إسبانيا", count: 1047, flag: "🇪🇸" },
  { country: "إيطاليا", count: 909, flag: "🇮🇹" },
  { country: "الصين", count: 611, flag: "🇨🇳" },
  { country: "الأردن", count: 499, flag: "🇯🇴" },
  { country: "تركيا", count: 393, flag: "🇹🇷" },
  { country: "ألمانيا", count: 332, flag: "🇩🇪" },
  { country: "البرتغال", count: 259, flag: "🇵🇹" },
  { country: "المملكة العربية السعودية", count: 185, flag: "🇸🇦" },
  { country: "الهند", count: 116, flag: "🇮🇳" },
  { country: "المملكة المتحدة", count: 106, flag: "🇬🇧" },
];

const TOP_PLAYERS = [
  { name: "PROFERT SPA", licenses: 448, sector: "مبيدات ومحسنات" },
  { name: "SARL CASAP", licenses: 297, sector: "مبيدات" },
  { name: "GOLDEN FIELD", licenses: 251, sector: "بذور" },
  { name: "SARL AGROVIPAL", licenses: 199, sector: "بذور" },
  { name: "EURL ASTRACHEM", licenses: 194, sector: "مواد كيميائية" },
  { name: "SARL ACI", licenses: 193, sector: "بذور ومبيدات" },
  { name: "SARL BPI ENH", licenses: 180, sector: "بذور" },
  { name: "SARL ACI SEEDS", licenses: 169, sector: "بذور" },
  { name: "SARL AGRICHEM", licenses: 165, sector: "مواد كيميائية" },
  { name: "SARL SRID", licenses: 163, sector: "مبيدات" },
];

const WILAYAS_WITH_VETS = [
  { name: "الجزائر", count: 20 },
  { name: "المسيلة", count: 20 },
  { name: "سطيف", count: 20 },
  { name: "باتنة", count: 18 },
  { name: "قسنطينة", count: 17 },
  { name: "برج بوعريريج", count: 13 },
  { name: "تيارت", count: 10 },
  { name: "معسكر", count: 9 },
  { name: "الجلفة", count: 9 },
  { name: "بومرداس", count: 8 },
  { name: "تيزي وزو", count: 8 },
  { name: "البويرة", count: 7 },
  { name: "البليدة", count: 7 },
  { name: "المدية", count: 6 },
  { name: "أم البواقي", count: 6 },
  { name: "النعامة", count: 5 },
  { name: "عين الدفلى", count: 5 },
  { name: "تلمسان", count: 5 },
  { name: "جيجل", count: 5 },
  { name: "قالمة", count: 5 },
];

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

const BAR = ({ value, max, color = "#e8a838", height = 8 }) => (
  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height, overflow: "hidden", flex: 1 }}>
    <div
      style={{
        width: `${(value / max) * 100}%`,
        height: "100%",
        background: color,
        borderRadius: 4,
        transition: "width 0.6s ease",
      }}
    />
  </div>
);

const StatCard = ({ number, label, sub, accent = "#e8a838" }) => (
  <div style={{
    background: "rgba(255,255,255,0.04)",
    border: `1px solid rgba(255,255,255,0.08)`,
    borderRadius: 12,
    padding: "20px 24px",
    flex: 1,
    minWidth: 140,
  }}>
    <div style={{ fontSize: 36, fontWeight: 800, color: accent, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
      {number}
    </div>
    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 6, fontWeight: 600 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{sub}</div>}
  </div>
);

const SectionHeader = ({ chapter, title, subtitle, accent }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{
      display: "inline-block",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.15em",
      color: accent,
      textTransform: "uppercase",
      marginBottom: 10,
      fontFamily: "monospace",
    }}>
      {chapter}
    </div>
    <h2 style={{
      fontSize: 28,
      fontWeight: 800,
      color: "#fff",
      margin: "0 0 10px 0",
      fontFamily: "'Playfair Display', serif",
      lineHeight: 1.2,
    }}>
      {title}
    </h2>
    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: 0, maxWidth: 540, lineHeight: 1.7 }}>
      {subtitle}
    </p>
  </div>
);

// ─── MAIN ───────────────────────────────────────────────────────────────────────

export default function MadrStory() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: "نظرة عامة", icon: "◎" },
    { label: "البذور", icon: "01" },
    { label: "الكيمياء", icon: "02" },
    { label: "المتحكمون", icon: "03" },
    { label: "البيطري", icon: "04" },
  ];

  const totalLicenses = 9532;
  const top10Count = TOP_PLAYERS.reduce((a, b) => a + b.licenses, 0);
  const top10Pct = Math.round((top10Count / totalLicenses) * 100);

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "#0d0f14",
      color: "#fff",
      fontFamily: "'IBM Plex Sans Arabic', 'Segoe UI', sans-serif",
    }}>
      {/* ── NAV ── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        overflowX: "auto",
        background: "rgba(255,255,255,0.02)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", padding: "16px 0", marginLeft: 16, whiteSpace: "nowrap", fontFamily: "monospace" }}>
          MADR · الشفافية الزراعية
        </div>
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              background: "none",
              border: "none",
              padding: "16px 16px",
              fontSize: 13,
              fontWeight: activeTab === i ? 700 : 400,
              color: activeTab === i ? "#e8a838" : "rgba(255,255,255,0.45)",
              borderBottom: activeTab === i ? "2px solid #e8a838" : "2px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 10, fontFamily: "monospace", marginLeft: 6, opacity: 0.6 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* ═══════════ TAB 0: OVERVIEW ═══════════ */}
        {activeTab === 0 && (
          <div>
            {/* Hero */}
            <div style={{
              background: "linear-gradient(135deg, rgba(232,168,56,0.12) 0%, rgba(106,176,76,0.06) 100%)",
              border: "1px solid rgba(232,168,56,0.2)",
              borderRadius: 16,
              padding: "48px 40px",
              marginBottom: 40,
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -40, left: -40,
                width: 200, height: 200,
                background: "radial-gradient(circle, rgba(232,168,56,0.15) 0%, transparent 70%)",
                borderRadius: "50%",
              }} />
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#e8a838", fontFamily: "monospace", fontWeight: 700, marginBottom: 16 }}>
                تحقيق في بيانات وزارة الفلاحة الجزائرية · يوليو 2025
              </div>
              <h1 style={{
                fontSize: 36,
                fontWeight: 900,
                fontFamily: "'Playfair Display', serif",
                margin: "0 0 16px 0",
                lineHeight: 1.2,
                color: "#fff",
              }}>
                ماذا تأكل الجزائر<br />
                <span style={{ color: "#e8a838" }}>— ومن أين يأتي؟</span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.8, margin: "0 0 24px 0", maxWidth: 540 }}>
                9,532 رخصة استيراد زراعي أصدرتها الوزارة. هذه ليست قائمة ما تُنتجه الجزائر — بل ما يدخلها من الخارج. البذور، المبيدات، الأدوية البيطرية. البيانات كانت متاحة. لكن أحد لم يرتبها بعد.
              </p>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                المصدر: madr.gov.dz/transparence · معالجة: ta9in.com
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
              <StatCard number="9,532" label="رخصة استيراد" sub="إجمالي السجلات" accent="#e8a838" />
              <StatCard number="5,058" label="مادة كيميائية" sub="مبيدات وأسمدة" accent="#6ab04c" />
              <StatCard number="1,198" label="شركة مرخصة" sub="متفاوتة الحجم جداً" accent="#22a6b3" />
              <StatCard number="19/58" label="ولاية بلا بيطري" sub="فجوة في الجنوب والغرب" accent="#fc5c65" />
            </div>

            {/* Story arc */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", fontFamily: "monospace", marginBottom: 20 }}>
                أربعة فصول · تحقيق واحد
              </div>
              {[
                { num: "01", title: "بذورنا ليست بذورنا", stat: "3,958 رخصة", detail: "الصين أولاً. أمريكا ثانياً. الجزائر لا تزرع بذورها.", color: "#e8a838", tab: 1 },
                { num: "02", title: "5,058 مادة كيميائية", stat: "إسبانيا وحدها = 1,047", detail: "ما الذي يُرش على طماطمك؟ مبيدات من أوروبا والصين.", color: "#6ab04c", tab: 2 },
                { num: "03", title: "من يتحكم في الاستيراد", stat: "شركة واحدة = 448 رخصة", detail: "سوق مُركَّز. عشر شركات تحمل ربع كل الرخص.", color: "#22a6b3", tab: 3 },
                { num: "04", title: "خريطة الفجوة البيطرية", stat: "19 ولاية صفر موزع", detail: "المواشي في الهامش. الجنوب شبه غائب عن الخريطة.", color: "#fc5c65", tab: 4 },
              ].map((ch) => (
                <div
                  key={ch.num}
                  onClick={() => setActiveTab(ch.tab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "18px 24px",
                    marginBottom: 8,
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid rgba(255,255,255,0.06)`,
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                >
                  <div style={{ fontSize: 28, fontWeight: 900, color: ch.color, fontFamily: "monospace", minWidth: 40, opacity: 0.7 }}>
                    {ch.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{ch.title}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{ch.detail}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: ch.color, textAlign: "left", whiteSpace: "nowrap" }}>
                    {ch.stat}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}>‹</div>
                </div>
              ))}
            </div>

            {/* Methodology note */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: "20px 24px",
            }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.8 }}>
                <strong style={{ color: "rgba(255,255,255,0.5)" }}>ملاحظة منهجية:</strong> هذه البيانات تعكس رخص الاستيراد المُعلنة فقط — وليس إجمالي الإنتاج الزراعي الجزائري. تشمل معالجتنا توحيد أكثر من 300 تسمية فئة مختلفة إلى تصنيفات قابلة للمقارنة. البيانات الخام تحتوي على أخطاء إملائية وتناقضات هي المصدر الأصلي.
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ TAB 1: SEEDS ═══════════ */}
        {activeTab === 1 && (
          <div>
            <SectionHeader
              chapter="الفصل الأول · 3,958 سجل"
              title="بذورنا ليست بذورنا"
              subtitle="أكثر من 3,900 ترخيص استيراد للبذور والشتلات والنباتات. أول مصدر: الصين. ثاني مصدر: إيطاليا. الجزائر تعتمد على بذور آتية من كل قارة — إلا الداخل."
              accent="#e8a838"
            />

            {/* Insight callout */}
            <div style={{
              background: "rgba(232,168,56,0.08)",
              border: "1px solid rgba(232,168,56,0.2)",
              borderRadius: 10,
              padding: "16px 20px",
              marginBottom: 32,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}>
              <div style={{ fontSize: 20 }}>🌾</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e8a838", marginBottom: 4 }}>الرهان الأكبر</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
                  الموز وحده يُهيمن على هذه القائمة — مئات الرخص لفاكهة واحدة مستوردة من كوستاريكا وكولومبيا. هذا يكشف أن "تبعية البذور" تشمل أيضاً المنتجات الاستهلاكية، ليس فقط بذور الزراعة.
                </div>
              </div>
            </div>

            {/* Chart */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "24px",
              marginBottom: 32,
            }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 20, fontFamily: "monospace" }}>
                أكبر 10 مصادر استيراد للبذور والنباتات
              </div>
              {SEEDS_BY_ORIGIN.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 20, fontSize: 16, textAlign: "center" }}>{r.flag}</div>
                  <div style={{ width: 130, fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: i < 3 ? 700 : 400 }}>{r.country}</div>
                  <BAR value={r.count} max={600} color={i === 0 ? "#e8a838" : i === 1 ? "#fd9644" : "rgba(255,255,255,0.3)"} height={6} />
                  <div style={{ width: 40, fontSize: 12, fontWeight: 700, color: i < 3 ? "#e8a838" : "rgba(255,255,255,0.5)", textAlign: "left" }}>
                    {r.count}
                  </div>
                </div>
              ))}
            </div>

            {/* Data quality note */}
            <div style={{
              background: "rgba(252,92,101,0.06)",
              border: "1px solid rgba(252,92,101,0.15)",
              borderRadius: 10,
              padding: "16px 20px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#fc5c65", fontFamily: "monospace", marginBottom: 8 }}>
                ⚠ مشاكل جودة البيانات الخام
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
                تحتوي البيانات الأصلية على <strong style={{ color: "rgba(255,255,255,0.8)" }}>أكثر من 90 تسمية مختلفة</strong> للفئة الواحدة: "BANANE" و"banane" و"BANANES FRAICHES" و"Bananes destinés à la consommation humaine" و"Fresh Green Cavendish Bananas" — كلها تعني الشيء ذاته. التوحيد ضروري قبل أي تحليل حقيقي.
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ TAB 2: CHEMICALS ═══════════ */}
        {activeTab === 2 && (
          <div>
            <SectionHeader
              chapter="الفصل الثاني · 5,058 سجل"
              title="5,058 مادة كيميائية زراعية"
              subtitle="مبيدات، فطريات، منظمات نمو، مصححات نقص معادن — مرخصة للدخول إلى أراضينا الزراعية. إسبانيا المورد الأول. الصين الثالث. هذا ما يُرش على طعامنا."
              accent="#6ab04c"
            />

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              <StatCard number="1,047" label="منتج إسباني" sub="أول مورد بفارق كبير" accent="#6ab04c" />
              <StatCard number="909" label="منتج إيطالي" sub="المرتبة الثانية" accent="#e8a838" />
              <StatCard number="611" label="منتج صيني" sub="ثالثاً والنمو مستمر" accent="#fc5c65" />
            </div>

            {/* Categories */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "24px",
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 20, fontFamily: "monospace" }}>
                التوزيع حسب نوع المنتج (بعد التوحيد)
              </div>
              {CHEMICALS_CLEAN.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                  <div style={{ width: 160, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", width: 160, fontFamily: "monospace" }}>{c.labelFr}</div>
                  <BAR value={c.count} max={900} color={c.color} height={5} />
                  <div style={{ width: 40, fontSize: 12, fontWeight: 700, color: c.color, textAlign: "left" }}>{c.count}</div>
                </div>
              ))}
            </div>

            {/* Origins */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "24px",
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 20, fontFamily: "monospace" }}>
                مصادر الاستيراد
              </div>
              {CHEMICALS_BY_ORIGIN.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 20, fontSize: 16, textAlign: "center" }}>{r.flag}</div>
                  <div style={{ width: 200, fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: i < 3 ? 700 : 400 }}>{r.country}</div>
                  <BAR value={r.count} max={1100} color={i === 0 ? "#6ab04c" : i === 1 ? "#e8a838" : "rgba(255,255,255,0.25)"} height={6} />
                  <div style={{ width: 45, fontSize: 12, fontWeight: 700, color: i < 3 ? "#6ab04c" : "rgba(255,255,255,0.45)", textAlign: "left" }}>
                    {r.count}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: "rgba(106,176,76,0.06)",
              border: "1px solid rgba(106,176,76,0.15)",
              borderRadius: 10,
              padding: "16px 20px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#6ab04c", fontFamily: "monospace", marginBottom: 8 }}>
                ⚠ مشاكل جودة البيانات الخام
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
                عمود "الفئة" الأصلي يحتوي على <strong style={{ color: "rgba(255,255,255,0.8)" }}>أكثر من 180 قيمة فريدة</strong> لـ12 نوع أساسي فقط. "BIOSTIMULANT" و"Biostimulant" و"bio stimulant" و"Bio Stimulant" و"BIOSTUMILANT" (خطأ إملائي) — كلها نفس الفئة. التحليل الحقيقي يحتاج تطبيع كامل.
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ TAB 3: PLAYERS ═══════════ */}
        {activeTab === 3 && (
          <div>
            <SectionHeader
              chapter="الفصل الثالث · 1,198 شركة"
              title="من يتحكم في الاستيراد"
              subtitle="1,198 شركة تحمل رخص استيراد زراعي. لكن التوزيع بعيد جداً عن التساوي. شركة واحدة تحمل 448 رخصة. وعشر شركات تتحكم في ربع السوق."
              accent="#22a6b3"
            />

            {/* Concentration insight */}
            <div style={{
              background: "rgba(34,166,179,0.08)",
              border: "1px solid rgba(34,166,179,0.2)",
              borderRadius: 12,
              padding: "24px",
              marginBottom: 32,
            }}>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: "#22a6b3", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                    {top10Pct}%
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
                    من إجمالي الرخص<br />في يد 10 شركات فقط
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 200 }}>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
                    من 1,198 شركة، أكبر 10 شركات تحمل <strong style={{ color: "#22a6b3" }}>{top10Count.toLocaleString()} رخصة</strong> من أصل {totalLicenses.toLocaleString()}. وشركة PROFERT وحدها تملك 4.7% من كل الرخص.
                  </div>
                </div>
              </div>
            </div>

            {/* Top players */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: 24,
            }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, fontFamily: "monospace" }}>
                  أكبر 10 شركات حسب عدد رخص الاستيراد
                </div>
              </div>
              {TOP_PLAYERS.map((p, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: i === 0 ? "rgba(34,166,179,0.06)" : "transparent",
                }}>
                  <div style={{ fontSize: 12, color: i === 0 ? "#22a6b3" : "rgba(255,255,255,0.2)", fontWeight: 700, width: 24, fontFamily: "monospace" }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? "#fff" : "rgba(255,255,255,0.75)" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{p.sector}</div>
                  </div>
                  <BAR value={p.licenses} max={500} color={i === 0 ? "#22a6b3" : "rgba(255,255,255,0.2)"} height={5} />
                  <div style={{ width: 36, fontSize: 13, fontWeight: 800, color: i === 0 ? "#22a6b3" : "rgba(255,255,255,0.5)", textAlign: "left" }}>
                    {p.licenses}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: "rgba(252,92,101,0.06)",
              border: "1px solid rgba(252,92,101,0.15)",
              borderRadius: 10,
              padding: "16px 20px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#fc5c65", fontFamily: "monospace", marginBottom: 8 }}>
                ⚠ مشكلة في عرض البيانات الحالي
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
                الجدول الحالي في الموقع يُكرر كل شركة عدة مرات (PROFERT تظهر 6+ مرات بنفس الرقم 448). هذا لأن كل رخصة سجل منفصل. الجدول يحتاج تجميع (GROUP BY) قبل العرض لمنع الإرباك.
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ TAB 4: VETERINARY ═══════════ */}
        {activeTab === 4 && (
          <div>
            <SectionHeader
              chapter="الفصل الرابع · 516 سجل"
              title="خريطة الفجوة البيطرية"
              subtitle="من 58 ولاية جزائرية، 19 ولاية لا يوجد فيها موزع بيطري مرخص واحد. الغرب والجنوب الكبير الأكثر تضرراً. المواشي في الهامش."
              accent="#fc5c65"
            />

            {/* Summary stats */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              <StatCard number="249" label="موزع بيطري" sub="في 39 ولاية فقط" accent="#fc5c65" />
              <StatCard number="161" label="ترخيص استيراد" sub="أدوية بيطرية" accent="#e8a838" />
              <StatCard number="106" label="مستورد" sub="شركة استيراد نشطة" accent="#22a6b3" />
              <StatCard number="19" label="ولاية بدون موزع" sub="من أصل 58" accent="#a29bfe" />
            </div>

            {/* Map representation */}
            <div style={{
              background: "rgba(252,92,101,0.06)",
              border: "1px solid rgba(252,92,101,0.12)",
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 16, fontFamily: "monospace" }}>
                الولايات الأكثر تغطية (بيطري) — أعلى 20 ولاية
              </div>
              {WILAYAS_WITH_VETS.map((w, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 90, fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: i < 5 ? 700 : 400 }}>{w.name}</div>
                  <BAR value={w.count} max={22} color={i < 3 ? "#fc5c65" : i < 8 ? "#fd9644" : "rgba(255,255,255,0.2)"} height={5} />
                  <div style={{ width: 24, fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "left" }}>{w.count}</div>
                </div>
              ))}
            </div>

            {/* Absent wilayas */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 12, fontFamily: "monospace" }}>
                الولايات الغائبة (19 ولاية بدون موزع بيطري مرخص)
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 2 }}>
                تمنراست · أدرار · تندوف · إليزي · برج باجي مختار · إن قزام · تيميمون · بني عباس · إن صالح · توقرت · جانت · منيعة · الوادي (الجنوب الشرقي) وولايات الهضاب الغربية.
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "#fc5c65", fontWeight: 600 }}>
                → معظمها ولايات جنوبية رغم أنها من أهم مناطق تربية الإبل والغنم في الجزائر.
              </div>
            </div>

            <div style={{
              background: "rgba(162,155,254,0.06)",
              border: "1px solid rgba(162,155,254,0.15)",
              borderRadius: 10,
              padding: "16px 20px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#a29bfe", fontFamily: "monospace", marginBottom: 8 }}>
                💡 فرصة لتحسين القصة
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
                هذا الفصل يصبح أقوى مع خريطة تفاعلية تلوّن الولايات. البيانات الموجودة كافية — كل ما تحتاجه هو GeoJSON للولايات الجزائرية مع Leaflet أو D3 لإظهار الفجوة بصرياً.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 11,
        color: "rgba(255,255,255,0.25)",
        fontFamily: "monospace",
        flexWrap: "wrap",
        gap: 8,
      }}>
        <span>بيانات: madr.gov.dz · يوليو 2025</span>
        <span>ta9in.com · madrdz.ta9in.com</span>
      </div>
    </div>
  );
}
