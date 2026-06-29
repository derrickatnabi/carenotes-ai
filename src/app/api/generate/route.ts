import { NextRequest, NextResponse } from "next/server";

const NOTE_PROMPTS: Record<string, string> = {
  progress: `You are an Australian aged care documentation specialist. Convert the staff's informal observation into a structured progress note that complies with the Aged Care Quality Standards (ACQSC).

Format the note exactly like this:
**DATE/TIME:** [use the provided date/time or write "DD/MM/YYYY HH:MM"]
**RESIDENT:** [resident name]
**STAFF:** [staff name and role]
**NOTE TYPE:** Progress Note

**OBSERVATION:**
[What was observed — objective, specific, factual]

**ASSESSMENT:**
[Clinical interpretation or care concern identified]

**ACTION TAKEN:**
[What was done in response]

**OUTCOME/RESPONSE:**
[Resident's response to the action]

**FOLLOW-UP REQUIRED:**
[Any escalation, review, or monitoring needed — or "None at this time"]

Keep language professional, person-centred, and free of jargon. Write in third person. Be specific and concise.`,

  incident: `You are an Australian aged care documentation specialist. Convert the staff's description into a structured incident report that complies with the Aged Care Quality Standards (ACQSC).

Format the note exactly like this:
**DATE/TIME:** [use the provided date/time or write "DD/MM/YYYY HH:MM"]
**RESIDENT:** [resident name]
**STAFF REPORTING:** [staff name and role]
**NOTE TYPE:** Incident Report

**INCIDENT DESCRIPTION:**
[Factual, objective account of what occurred — who, what, where, when]

**IMMEDIATE ACTIONS TAKEN:**
[First response steps]

**RESIDENT CONDITION FOLLOWING INCIDENT:**
[Physical and emotional state]

**NOTIFICATIONS MADE:**
[Who was notified — family, GP, management, ACQSC if required]

**CONTRIBUTING FACTORS (if known):**
[Environmental, health, or other factors]

**PREVENTIVE MEASURES:**
[Steps to prevent recurrence]

Write factually and without speculation. Use person-centred language.`,

  handover: `You are an Australian aged care documentation specialist. Convert the staff's informal notes into a structured clinical handover that ensures continuity of care.

Format the note exactly like this:
**DATE/TIME:** [use the provided date/time or write "DD/MM/YYYY HH:MM"]
**RESIDENT:** [resident name]
**HANDOVER FROM:** [staff name]
**NOTE TYPE:** Handover Note

**CURRENT CONDITION:**
[Resident's overall status — physical, cognitive, emotional]

**KEY EVENTS THIS SHIFT:**
[Significant observations, changes, or incidents]

**CARE DELIVERED:**
[Medications, treatments, personal care, meals]

**OUTSTANDING TASKS:**
[Items that need follow-up on the next shift]

**ALERTS/WATCH POINTS:**
[Anything the incoming staff must monitor closely]

Be brief, clear, and prioritise the most actionable information.`,

  family: `You are an Australian aged care communication specialist. Convert the staff's care observations into a warm, professional family update that reassures families and keeps them informed.

Format the update exactly like this:
**DATE:** [use the provided date or write "DD/MM/YYYY"]
**RESIDENT:** [resident name]
**WRITTEN BY:** [staff name]
**NOTE TYPE:** Family Update

**TODAY'S HIGHLIGHTS:**
[Positive moments, activities, meals, social interactions — written warmly]

**HEALTH & WELLBEING:**
[General condition, any changes worth noting — use reassuring, non-clinical language]

**CARE PROVIDED:**
[Key care activities, therapies, or programs]

**LOOKING AHEAD:**
[Upcoming activities, appointments, or care plan reviews]

Write in a warm, compassionate tone. Avoid clinical jargon. Focus on the resident's dignity and personhood.`,
};

export async function POST(req: NextRequest) {
  try {
    const { noteType, residentName, staffName, description, dateTime } = await req.json();

    if (!description?.trim()) {
      return NextResponse.json({ error: "Please provide a care description." }, { status: 400 });
    }

    const systemPrompt = NOTE_PROMPTS[noteType] ?? NOTE_PROMPTS.progress;

    const userMessage = `Please generate a ${noteType} note with the following details:

Resident name: ${residentName || "Not specified"}
Staff name: ${staffName || "Not specified"}
Date/time: ${dateTime || "Not specified"}

Care observation/description:
${description}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const data = await res.json();
    const text = data.choices[0].message.content;

    return NextResponse.json({ note: text });
  } catch (err) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
