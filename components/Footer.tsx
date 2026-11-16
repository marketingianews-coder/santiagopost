import Link from "next/link";
import { categorias } from "@/lib/categorias";

export default function Footer() {
  return (
    <footer className="bg-tinta text-papel mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 text-sm mb-6">
          {categorias.map((c) => (
            <Link key={c.slug} href={`/categoria/${c.slug}`} className="hover:text-white/70 transition-colors">
              {c.nombre}
            </Link>
          ))}
        </div>
        <p className="text-papel/50 text-xs">
          © {new Date().getFullYear()} Santiago Post · Santiago, Chile
        </p>
      </div>
    </footer>
  );
}
