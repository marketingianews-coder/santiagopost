// Abstracción de almacenamiento: usa GitHub API (producción, con GITHUB_TOKEN) o el
// filesystem local (desarrollo). El panel y el agente escriben a través de aquí.
import fs from 'node:fs'
import path from 'node:path'
import { Octokit } from '@octokit/rest'
import { SITE } from './site'

const OWNER = process.env.GITHUB_OWNER || 'marketingianews-coder'
const REPO = process.env.GITHUB_REPO || SITE.repo
const BRANCH = process.env.GITHUB_BRANCH || 'main'
const ROOT = process.cwd()

export const usingGitHub = () => !!process.env.GITHUB_TOKEN
// `cache: 'no-store'` evita que Next.js cachee las respuestas de la API de GitHub
// (si no, el panel sirve listados/archivos desactualizados tras publicar o subir borradores).
const gh = () =>
  new Octokit({
    auth: process.env.GITHUB_TOKEN,
    request: { fetch: (url: string, opts: RequestInit = {}) => fetch(url, { ...opts, cache: 'no-store' }) },
  })

// --- lectura ---
export async function readFile(repoPath: string): Promise<{ content: string; sha?: string } | null> {
  if (usingGitHub()) {
    try {
      const { data } = await gh().repos.getContent({ owner: OWNER, repo: REPO, path: repoPath, ref: BRANCH })
      if (Array.isArray(data) || !('content' in data)) return null
      return { content: Buffer.from(data.content, 'base64').toString('utf8'), sha: data.sha }
    } catch { return null }
  }
  const abs = path.join(ROOT, repoPath)
  return fs.existsSync(abs) ? { content: fs.readFileSync(abs, 'utf8') } : null
}

export async function listDir(repoPath: string): Promise<string[]> {
  if (usingGitHub()) {
    try {
      const { data } = await gh().repos.getContent({ owner: OWNER, repo: REPO, path: repoPath, ref: BRANCH })
      return Array.isArray(data) ? data.filter(d => d.type === 'file').map(d => d.name) : []
    } catch { return [] }
  }
  const abs = path.join(ROOT, repoPath)
  return fs.existsSync(abs) ? fs.readdirSync(abs) : []
}

// --- escritura ---
export async function writeFile(repoPath: string, content: string, message: string, sha?: string): Promise<void> {
  if (usingGitHub()) {
    let finalSha = sha
    if (!finalSha) {
      try {
        const { data } = await gh().repos.getContent({ owner: OWNER, repo: REPO, path: repoPath, ref: BRANCH })
        if (!Array.isArray(data) && 'sha' in data) finalSha = data.sha
      } catch { /* archivo nuevo */ }
    }
    await gh().repos.createOrUpdateFileContents({
      owner: OWNER, repo: REPO, path: repoPath, branch: BRANCH, message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      ...(finalSha ? { sha: finalSha } : {}),
    })
    return
  }
  const abs = path.join(ROOT, repoPath)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content)
}

export async function writeBinary(repoPath: string, base64: string, message: string): Promise<void> {
  if (usingGitHub()) {
    let sha: string | undefined
    try {
      const { data } = await gh().repos.getContent({ owner: OWNER, repo: REPO, path: repoPath, ref: BRANCH })
      if (!Array.isArray(data) && 'sha' in data) sha = data.sha
    } catch { /* nuevo */ }
    await gh().repos.createOrUpdateFileContents({ owner: OWNER, repo: REPO, path: repoPath, branch: BRANCH, message, content: base64, ...(sha ? { sha } : {}) })
    return
  }
  const abs = path.join(ROOT, repoPath)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, Buffer.from(base64, 'base64'))
}

export async function deleteFile(repoPath: string, message: string): Promise<void> {
  if (usingGitHub()) {
    try {
      const { data } = await gh().repos.getContent({ owner: OWNER, repo: REPO, path: repoPath, ref: BRANCH })
      if (!Array.isArray(data) && 'sha' in data) {
        await gh().repos.deleteFile({ owner: OWNER, repo: REPO, path: repoPath, branch: BRANCH, message, sha: data.sha })
      }
    } catch { /* no existe */ }
    return
  }
  const abs = path.join(ROOT, repoPath)
  if (fs.existsSync(abs)) fs.unlinkSync(abs)
}
