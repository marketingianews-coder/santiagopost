import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CATEGORIAS = [
  "Política", "Economía", "Finanzas", "Regiones",
  "Negocios y empresas", "Trabajo y pensiones",
  "Vivienda y construcción", "Energía y minería", "Tecnología",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-papel font-serif">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-tinta/60 text-lg">Próximamente</p>
        </div>
      </main>
      <Footer categorias={CATEGORIAS} />
    </div>
  );
}
