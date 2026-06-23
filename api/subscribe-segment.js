export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, segment, goal } = req.body

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' })
  }

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [3], // Newsletter DiaspoInvest
        attributes: {
          SEGMENT: segment || 'unknown', // 'beginner', 'junior', 'advanced'
          GOAL: goal || 'unknown',       // 'learn', 'analyze', 'optimize'
        },
        updateEnabled: true,
      }),
    })

    const data = await response.json()

    if (response.status === 201 || response.status === 204) {
      return res.status(200).json({ success: true })
    }

    if (data.code === 'duplicate_parameter') {
      return res.status(200).json({ success: true, already: true })
    }

    return res.status(response.status).json({ error: data.message || 'Brevo error' })
  } catch (error) {
    console.error('Subscribe error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}
