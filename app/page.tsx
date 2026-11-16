import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { latestArticles } from "@/lib/data";

export const dynamic = "force-static";

export default function Home() {
  const posts = latestArticles(24);
  const destacada = posts[0];
  const resto = posts.slice(1);

  return (
    <div className="min-h-screen bg-papel font-serif">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <h1 className="text-3xl font-serif">Santiago Post</h1>
            <p className="text-tinta/50 mt-3">Economía, política y negocios de Chile. Próximamente.</p>
          </div>
        ) : (
          <>
            {destacada && (
              <a href={`/articulo/${destacada.slug}`} className="group block mb-10 pb-10 border-b border-tinta/10">
                <span className="text-xs font-sans font-semibold uppercase tracking-wide text-rojo-oscuro">{destacada.category}</span>
                <h1 className="text-4xl md:text-5xl font-serif leading-tight mt-2 group-hover:text-rojo-oscuro transition-colors">{destacada.title}</h1>
                <p className="text-lg text-tinta/70 mt-3 max-w-3xl">{destacada.excerpt}</p>
                <p className="text-xs text-tinta/40 mt-3 font-sans">{destacada.date} · {destacada.readTime}</p>
              </a>
            )}
            <div className="grid md:grid-cols-3 gap-6">
              {resto.map((a) => <NewsCard key={a.id} a={a} />)}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
