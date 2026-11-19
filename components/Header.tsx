import Image from "next/image";
import Link from "next/link";
import { categorias } from "@/lib/categorias";

export default function Header() {
  return (
    <header className="bg-papel border-b-2 border-tinta">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-7 flex justify-center border-b border-tinta/20">
          <Link href="/">
            <Image src="/logo-claro.svg" alt="Santiago Post" width={320} height={147} priority />
          </Link>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-1 py-2 text-sm">
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="text-tinta hover:text-rojo-oscuro transition-colors"
            >
              {c.nombre}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
