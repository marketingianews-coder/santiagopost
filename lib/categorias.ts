// Taxonomía oficial. Fuente de verdad para la nav y validación.
export type Categoria = { slug: string; nombre: string; descripcion: string }

export const categorias: Categoria[] = [
  { slug: 'politica', nombre: 'Política', descripcion: 'Gobierno, Congreso y la actualidad política de Chile.' },
  { slug: 'economia', nombre: 'Economía', descripcion: 'Actividad económica, IPC, empleo y política monetaria.' },
  { slug: 'finanzas', nombre: 'Finanzas', descripcion: 'Mercados, inversiones, bancos y finanzas personales.' },
  { slug: 'regiones', nombre: 'Regiones', descripcion: 'Qué pasa en las regiones de Chile más allá de Santiago.' },
  { slug: 'negocios-y-empresas', nombre: 'Negocios y empresas', descripcion: 'Empresas, resultados, fusiones y movimientos corporativos.' },
  { slug: 'trabajo-y-pensiones', nombre: 'Trabajo y pensiones', descripcion: 'Empleo, sueldos, reforma de pensiones y mundo laboral.' },
  { slug: 'vivienda-y-construccion', nombre: 'Vivienda y construcción', descripcion: 'Mercado inmobiliario, construcción y acceso a la vivienda.' },
  { slug: 'energia-y-mineria', nombre: 'Energía y minería', descripcion: 'Minería, cobre, litio y transición energética.' },
  { slug: 'tecnologia', nombre: 'Tecnología', descripcion: 'Tecnología, innovación y economía digital.' },
]

export const categoriaBySlug = (slug: string) => categorias.find((c) => c.slug === slug)
export const esCategoriaValida = (slug: string) => categorias.some((c) => c.slug === slug)
export const nombreCategoria = (slug: string) => categoriaBySlug(slug)?.nombre ?? slug
