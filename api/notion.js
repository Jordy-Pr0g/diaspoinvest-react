// Vercel serverless function — proxy Notion API (évite les restrictions CORS navigateur)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { notionKey, databaseId, agentNom, agentId, sujet, result } = req.body

  if (!notionKey || !databaseId) {
    return res.status(400).json({ error: 'notionKey et databaseId requis' })
  }

  // Découpe le contenu en blocs de 2000 chars max (limite Notion)
  const chunks = []
  for (let i = 0; i < result.length; i += 1990) {
    chunks.push(result.slice(i, i + 1990))
  }

  const children = chunks.map((chunk) => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: chunk } }],
    },
  }))

  const body = {
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [{ text: { content: `[${agentNom}] ${sujet.slice(0, 90)}` } }],
      },
      Agent: { select: { name: agentNom } },
      Type: { select: { name: agentId } },
      Date: { date: { start: new Date().toISOString().split('T')[0] } },
      Statut: { select: { name: 'Draft' } },
    },
    children,
  }

  const notionRes = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify(body),
  })

  const data = await notionRes.json()

  if (!notionRes.ok) {
    return res.status(notionRes.status).json({ error: data.message || 'Erreur Notion' })
  }

  return res.status(200).json({ url: data.url, id: data.id })
}
