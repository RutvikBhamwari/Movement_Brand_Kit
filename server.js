import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

app.post('/api/brand', async (req, res) => {
  const { discipline, oneWord, style, audience, goals, philosophy } = req.body

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are a world-class Creative Strategist and Brand Designer
specialising in personal brands for movement artists, athletes, and physical creators.
Your philosophy: A great personal brand doesn't invent an identity.
It distills and amplifies what already exists in the person.
Every output you create should feel like it was always theirs.
You always write in clear, specific, actionable language.
You never produce generic outputs.
You always explain the WHY behind every recommendation.`,
      messages: [{
        role: 'user',
        content: `Create a complete personal brand kit for this movement creator:

DISCIPLINE: ${discipline}
ONE WORD THAT DESCRIBES THEIR MOVEMENT: ${oneWord}
AESTHETIC AND VISUAL STYLE: ${style}
TARGET AUDIENCE: ${audience}
BRAND GOALS: ${goals}
MOVEMENT PHILOSOPHY: ${philosophy}

Format your response exactly like this:

VISUAL IDENTITY:
Colour Palette:
[5 colours. For each: hex code, name, one sentence explaining why it belongs to this creator]

Typography:
[Display font + why. Body font + why. How they work together.]

Aesthetic Direction:
[3-4 sentences describing the visual world. Specific and evocative.]

---

TONE OF VOICE:
How to write captions:
[3 specific principles]

What to avoid:
[3 specific things that would feel wrong]

Platform adjustments:
[One sentence each for Instagram, TikTok, LinkedIn]

---

CONTENT STRATEGY:
Content Pillars:
[3 pillars. Name, description, one example post idea each]

Posting Rhythm:
[Specific recommendation with reasoning]

Content Formats:
[Which formats suit this creator and why]

---

BRAND POSITIONING:
Your Unique Angle:
[One sentence capturing what makes this creator different]

Who You're Different From:
[2-3 sentences on the dominant aesthetic and how this creator stands apart]

Your Brand Statement:
[2-3 sentence manifesto. Poetic but grounded.]

Your One-Line Bio:
[Single line for Instagram bio right now]`
      }]
    })

    res.json({ result: message.content[0].text })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(3001, () => {
  console.log('Brand Kit API running on port 3001')
})