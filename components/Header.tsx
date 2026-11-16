import Image from "next/image";
import Link from "next/link";

const CATEGORIAS = [
  { label: "Política", slug: "politica" },
  { label: "Economía", slug: "economia" },
  { label: "Finanzas", slug: "finanzas" },
  { label: "Regiones", slug: "regiones" },
  { label: "Negocios y empresas", slug: "negocios-y-empresas" },
  { label: "Trabajo y pensiones", slug: "trabajo-y-pensiones" },
  { label: "Vivienda y construcción", slug: "vivienda-y-construccion" },
  { label: "Energía y minería", slug: "energia-y-mineria" },
  { label: "Tecnología", slug: "tecnologia" },
];

export default function Header() {
  return (
    <header className="bg-papel border-b-2 border-tinta">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-4 text-center border-b border-tinta/20">
          <Link href="/">
            <Image src="/logo-claro.svg" alt="Santiago Post" width={320} height={80} priority />
          </Link>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-1 py-2 text-sm font-sans">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="text-tinta hover:text-rojo-oscuro transition-colors"
            >
              {c.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
