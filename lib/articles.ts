import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { marked } from 'marked'
import { SITE } from './site'

const ART_DIR = path.join(process.cwd(), 'articulos')

// Interruptor: mientras esté en true, TODOS los links externos salen con rel="nofollow".
const EXTERNAL_LINKS_NOFOLLOW = true

// Agrega rel="nofollow noopener noreferrer" + target="_blank" a cada <a> externo del HTML.
function marcarLinksExternos(html: string): string {
  return html.replace(/<a\s+href="([^"]+)"([^>]*)>/gi, (full, href, rest) => {
    const esExterno = /^https?:\/\//i.test(href) && !href.includes(SITE.host)
    if (!esExterno) return full
    let attrs = rest
    if (EXTERNAL_LINKS_NOFOLLOW && !/\brel=/i.test(attrs)) attrs += ' rel="nofollow noopener noreferrer"'
    if (!/\btarget=/i.test(attrs)) attrs += ' target="_blank"'
    return `<a href="${href}"${attrs}>`
  })
}

export type ArticleBody = { frontmatter: Record<string, unknown>; html: string; markdown: string }

// Lee articulos/{id}.md y devuelve el frontmatter + el cuerpo renderizado a HTML.
export function getArticleBody(id: string): ArticleBody | null {
  const file = path.join(ART_DIR, `${id}.md`)
  if (!fs.existsSync(file)) return null
  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  // El H1 se muestra desde la metadata; se quita del cuerpo para no duplicarlo.
  const body = content.replace(/^\s*#\s+.+\r?\n/, '')
  const html = marcarLinksExternos(marked.parse(body, { async: false }) as string)
  return { frontmatter: data, html, markdown: content }
}

export function articleFileExists(id: string): boolean {
  return fs.existsSync(path.join(ART_DIR, `${id}.md`))
}
