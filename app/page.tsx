import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/data";
import { latestArticles, articlesByCategory } from "@/lib/data";
import { categorias, nombreCategoria } from "@/lib/categorias";

export const revalidate = 3600; // ISR: refresca indicadores cada hora

const HUES = [215, 200, 165, 28, 350, 230, 190, 40, 260];

// Marcador de imagen: foto real del artículo o un gradiente sobrio (como la maqueta).
function Ph({ a, h, seed }: { a?: Article; h: number; seed: number }) {
  const hue = HUES[seed % HUES.length];
  return (
    <div className="ph" style={{ height: h, background: `linear-gradient(160deg,hsl(${hue} 16% 34%),hsl(${hue} 20% 14%))` }}>
      {a?.image ? <img src={a.image} alt="" /> : null}
    </div>
  );
}

// Tarjeta de artículo (módulos Economía / Regiones).
function Card({ a, h, seed }: { a: Article; h: number; seed: number }) {
  return (
    <Link href={`/articulo/${a.slug}`} className="card" style={{ display: "block" }}>
      <Ph a={a} h={h} seed={seed} />
      <h3 style={{ fontSize: 18 }}>{a.title}</h3>
      <div className="m">{a.readTime}</div>
    </Link>
  );
}

const Logo = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/logo-oscuro.svg" alt="Santiago Post" style={{ height: 130, width: 'auto' }} />
);

// Indicadores económicos reales desde mindicador.cl (revalida cada hora).
async function Indicadores() {
  let d: Record<string, { valor?: number }> | null = null;
  try {
    const res = await fetch("https://mindicador.cl/api", { next: { revalidate: 3600 } });
    if (res.ok) d = await res.json();
  } catch {
    d = null;
  }
  const fmt = (v: number | undefined, dec = 2) =>
    v == null ? "—" : v.toLocaleString("es-CL", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const rows: [string, string][] = [
    ["Dólar", d?.dolar?.valor != null ? `$ ${fmt(d.dolar.valor)}` : "—"],
    ["UF", d?.uf?.valor != null ? `$ ${fmt(d.uf.valor)}` : "—"],
    ["IPC mensual", d?.ipc?.valor != null ? `${fmt(d.ipc.valor, 1)} %` : "—"],
    ["Cobre (lb)", d?.libra_cobre?.valor != null ? `US$ ${fmt(d.libra_cobre.valor)}` : "—"],
    ["UTM", d?.utm?.valor != null ? `$ ${fmt(d.utm.valor, 0)}` : "—"],
  ];
  return (
    <table className="ind" style={{ marginTop: 8 }}>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}><td>{k}</td><td>{v}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Home() {
  const posts = latestArticles(20);
  const porCat = (slug: string, n: number) => {
    const c = articlesByCategory(slug);
    return (c.length ? c : posts).slice(0, n);
  };
  const destacada = posts[0];
  const colItems = posts.slice(1, 5);
  const economia = porCat("economia", 4);
  const regiones = porCat("regiones", 4);
  const opinion = (articlesByCategory("politica").length ? posts : posts).slice(0, 3);
  const ultimo = posts.slice(0, 6);
  const leido = posts.slice(0, 5);

  const vars: React.CSSProperties = {
    // @ts-expect-error CSS custom properties
    "--bg": "#F1E9DA", "--tx": "#1a1612", "--mu": "#5e554a", "--ln": "rgba(26,22,18,.2)",
    "--sf": "#FAF5EA", "--ac": "#BB372F", "--hf": "'Gloock'", "--bf": "'Newsreader'", "--hw": 400,
    "--hbg": "#2A2B2F", "--htx": "#F1F1EE", "--hln": "rgba(255,255,255,.2)", "--hac": "#F0463C",
  };

  return (
    <div className="site" style={{ ...vars, background: "#F1E9DA" }}>
      <div className="sp">
        {/* Encabezado: logo centrado + nav */}
        <div className="hdr hb">
          <div className="lg"><Link href="/"><Logo /></Link></div>
          <nav className="nv">
            {categorias.map((c, i) => (
              <Link key={c.slug} href={`/categoria/${c.slug}`} className={i === 0 ? "on" : ""}>{c.nombre}</Link>
            ))}
          </nav>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <h1 style={{ fontSize: 40 }}>Santiago Post</h1>
            <p className="dek">Política, economía, finanzas y regiones de Chile, explicadas con contexto.</p>
          </div>
        ) : (
          <>
            {/* Módulo 0 — Portada en 3 columnas */}
            <section className="mod">
              <div className="cols">
                <div className="col">
                  <div className="k">{nombreCategoria(destacada.category)}</div>
                  <h1><Link href={`/articulo/${destacada.slug}`}>{destacada.title}</Link></h1>
                  <p className="dek">{destacada.excerpt}</p>
                  <div className="by">POR {destacada.author.toUpperCase()} · {destacada.readTime.toUpperCase()} DE LECTURA</div>
                  <div style={{ marginTop: 16 }}><Ph a={destacada} h={230} seed={0} /></div>
                </div>
                <div className="col">
                  {colItems.map((a) => (
                    <div className="it" key={a.id}>
                      <div className="k">{nombreCategoria(a.category)}</div>
                      <h3><Link href={`/articulo/${a.slug}`}>{a.title}</Link></h3>
                    </div>
                  ))}
                </div>
                <div className="col">
                  <div className="k">Indicadores</div>
                  <Indicadores />
                  <div className="box">
                    <h4>El dato del día</h4>
                    <div style={{ fontSize: 15, lineHeight: 1.4 }}>Un número, un gráfico y una explicación en tres líneas.</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Módulo 1 — Economía */}
            <section className="mod"><div className="pad">
              <h2 className="sh">Economía</h2>
              <div className="g4">{economia.map((a, i) => <Card key={a.id} a={a} h={i === 0 ? 130 : 110} seed={i + 1} />)}</div>
            </div></section>

            {/* Módulo 2 — Opinión */}
            <section className="mod"><div className="pad">
              <h2 className="sh">Opinión</h2>
              <div className="ops">
                {opinion.map((a, i) => (
                  <div className="op" key={a.id}>
                    <div className="who"><span className="av">C{i + 1}</span>{nombreCategoria(a.category)}</div>
                    <h3><Link href={`/articulo/${a.slug}`}>{a.title}</Link></h3>
                  </div>
                ))}
              </div>
            </div></section>

            {/* Módulo 3 — Regiones */}
            <section className="mod"><div className="pad">
              <h2 className="sh">Regiones</h2>
              <div className="g4">{regiones.map((a, i) => <Card key={a.id} a={a} h={i === 0 ? 130 : 110} seed={i + 4} />)}</div>
            </div></section>

            {/* Módulo 4 — Último minuto + Lo más leído */}
            <section className="mod"><div className="pad two ult">
              <div>
                <h2 className="sh">Último minuto</h2>
                {ultimo.map((a) => (
                  <div className="ev" key={a.id}>
                    <time>{a.date.slice(5)}</time>
                    <span><Link href={`/articulo/${a.slug}`}>{a.title}</Link></span>
                  </div>
                ))}
              </div>
              <div className="side">
                <h4>Lo más leído</h4>
                {leido.map((a, i) => (
                  <div className="rk" key={a.id}><b>{i + 1}</b><span><Link href={`/articulo/${a.slug}`}>{a.title}</Link></span></div>
                ))}
              </div>
            </div></section>

            {/* Módulo 5 — Newsletter */}
            <section className="mod"><div className="nl">
              <h2>Lo importante de Chile, en tu correo cada mañana</h2>
              <div className="inp">tu@correo.cl</div>
              <button>Suscribirme</button>
            </div></section>

            {/* Módulo 6 — Temas de interés */}
            <section className="mod"><div className="pad">
              <h2 className="sh">Temas de interés</h2>
              <div className="tiles">
                <Link href="/categoria/finanzas" className="tile" style={{ background: "var(--ac)", color: "#fff", borderColor: "transparent" }}>
                  <small>&nbsp;</small><div><h3>Tu plata</h3><small>ahorro, deudas y créditos</small></div>
                </Link>
                <Link href="/categoria/trabajo-y-pensiones" className="tile" style={{ background: "var(--tx)", color: "var(--bg)", borderColor: "transparent" }}>
                  <small>&nbsp;</small><div><h3>Pensiones</h3><small>la reforma y tu cuenta</small></div>
                </Link>
                <Link href="/categoria/vivienda-y-construccion" className="tile" style={{ background: "var(--sf)" }}>
                  <small>&nbsp;</small><div><h3>Vivienda</h3><small>arriendo, subsidios, compra</small></div>
                </Link>
                <Link href="/categoria/energia-y-mineria" className="tile" style={{ background: "var(--sf)" }}>
                  <small>&nbsp;</small><div><h3>Energía y minería</h3><small>litio, cobre y precios</small></div>
                </Link>
              </div>
            </div></section>
          </>
        )}

        {/* Módulo 7 — Pie */}
        <section className="mod"><div className="ft">
          <div><h4>Santiago Post</h4><p>Política, economía y regiones, explicadas con contexto.</p></div>
          <div><h4>Secciones</h4>{categorias.slice(0, 4).map((c) => <p key={c.slug}><Link href={`/categoria/${c.slug}`}>{c.nombre}</Link></p>)}</div>
          <div><h4>Más</h4>{categorias.slice(4).map((c) => <p key={c.slug}><Link href={`/categoria/${c.slug}`}>{c.nombre}</Link></p>)}</div>
          <div><h4>Medio</h4><p>Quiénes somos</p><p>Contacto</p><p>Publicidad</p><p>Términos</p></div>
        </div></section>
      </div>
    </div>
  );
}
