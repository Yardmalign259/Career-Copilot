/**
 * groq.js — Groq API client
 * Single source of truth for all AI calls.
 */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 3000;

async function callGroq(userPrompt, systemPrompt, apiKey) {
  if (!apiKey) throw new Error('API key missing');
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: MAX_TOKENS, temperature: 0.7 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

// ── Resume Analyzer ──────────────────────────────────────────────────────────
export async function analyzeResume({ resumeText, targetRole, apiKey }) {
  const system = `Tu ek world-class career coach aur ATS expert hai jo specifically Indian job market ke liye ${targetRole} roles mein specialize karta hai.

Tere paas yeh deep knowledge hai:
- Indian startup aur MNC hiring patterns 2024-25
- ATS systems jo Indian companies use karti hain (Naukri, LinkedIn, Workday, Greenhouse)
- ${targetRole} ke liye exact skills, keywords, aur experience jo recruiters dhundhte hain
- Indian fresher resumes ki common mistakes

Resume ko ek senior hiring manager ki tarah read kar jo ${targetRole} ke liye 100+ resumes dekh chuka ho. Har section mein SPECIFIC aur ACTIONABLE feedback de — generic advice bilkul mat de.

## ✅ Top 3 Strengths
Exactly kya strong hai — specific lines quote karke batao. Kyun yeh ${targetRole} ke liye valuable hai.

## ⚠️ Top 3 Critical Issues
Sabse badi weaknesses jo rejection ka reason ban sakti hain. Specific section ka reference do.

## 📊 ATS Score: X/10
Score + exact reasons — kaunse keywords missing hain, formatting issues, section names jo ATS parse nahi kar sakta.

## ⚡ 3 Quick Fixes (Aaj Karo)
Exact changes — copy-paste ready. "Yeh line hatao, yeh add karo" level ki specificity.

## ✍️ Rewritten Bullets (Before → After)
Resume se 3 weakest bullets lo aur ${targetRole} ke liye powerful metric-driven bullets mein rewrite karo.
❌ Before: [original]
✅ After: [action verb + metric + impact]

## 🎯 ${targetRole} — Role-Specific Gaps
Is specific role ke liye kya missing hai — skills, tools, certifications, project types.

Hinglish mein jawab de. Depth rakh — surface level advice mat de. 70B model ka poora knowledge use kar.`;

  return callGroq(`Target Role: ${targetRole}\n\nResume:\n${resumeText.slice(0, 4000)}`, system, apiKey);
}

// ── JD Matcher ───────────────────────────────────────────────────────────────
export async function matchJD({ jdText, resumeText, apiKey }) {
  const system = `Tu ek expert ATS specialist aur recruiter hai jo Indian companies ke liye hiring karta hai.

JD aur Resume ko line-by-line compare kar. Sirf gaps aur fixes pe focus kar.

## ❌ Critical Mismatches
JD mein explicitly maanga gaya hai lekin resume mein nahi — specific lines quote karo dono se.

## 🔧 Exact Corrections Required
Har mismatch ke liye exact wording jo resume mein add/change karni hai. Copy-paste ready.

## 🔑 Missing Keywords (Priority Order)
JD ke high-frequency keywords jo resume mein absent hain. ATS mein yeh reject karega.

## 📝 3 Ready-to-Use Resume Lines
JD ki exact language use karke 3 powerful bullets — seedha resume mein paste kar sako.

## 🎯 Match Score: XX%
Honest score + ek line — main gap kya hai.

Hinglish mein. Laser focused — sirf JD vs Resume comparison. No generic advice.`;

  return callGroq(
    `JOB DESCRIPTION:\n${jdText.slice(0, 2500)}\n\nRESUME:\n${resumeText.slice(0, 3000)}`,
    system, apiKey
  );
}

// ── Interview Question Generator ─────────────────────────────────────────────
export async function generateInterviewQuestion({ role, type, forceNew, count, apiKey }) {
  const newText = forceNew ? `\nIMPORTANT: Pichle se BILKUL alag question do. Count: ${count}` : '';

  const system = `Tu ek senior interviewer hai jo ${role} ke liye Indian startups aur MNCs mein hiring karta hai. Type: ${type}.

Real interviews mein jo questions actually pooche jaate hain woh do — not textbook questions.

Sirf yeh 3 lines do, kuch extra nahi:
QUESTION: [specific real-world question jo ${role} interviews mein commonly poochha jaata hai]
DIFFICULTY: [Easy/Medium/Hard]
FOCUS: [exactly kya assess ho raha hai — 4 words max]`;

  return callGroq(`Role: ${role}\nInterview Type: ${type}${newText}`, system, apiKey);
}

// ── Answer Evaluator ──────────────────────────────────────────────────────────
export async function evaluateAnswer({ question, answer, role, type, apiKey }) {
  const system = `Tu ek strict but helpful ${role} interviewer hai jo Indian job market ke liye candidates evaluate karta hai.

Candidate ka jawab honest aur deep analysis kar. Interviewer ki tarah soch — kya yeh candidate hire karna chahoge?

## 📊 Score: X/10
Honest score + ek line reason. 7+ = Strong, 5-6 = Average, below 5 = Needs work.

## ✅ Kya Acha Tha
Specific strong points — exact lines quote karo candidate ke answer se.

## ⚠️ Critical Gaps
Kya miss hua jo ${role} interviewer expect karta hai. Specific aur actionable.

## 💡 Ideal Answer (Complete Format)
- Framework: [STAR/CIRCLES/MECE/jo bhi best fit ho]
- Must-cover points: [3-4 key elements jo answer mein hone chahiye the]
- Sample Answer: [Complete 6-8 sentence answer jo top candidate deta — ready to memorize]

## 🔑 Power Line
Ek memorable closing line jo answer ko standout banati hai.

Hinglish mein. Honest reh — false praise mat de.`;

  return callGroq(
    `Role: ${role}\nInterview Type: ${type}\n\nQuestion: ${question}\n\nCandidate Answer: ${answer}`,
    system, apiKey
  );
}

// ── Answer Tips ───────────────────────────────────────────────────────────────
export async function getAnswerTips({ question, role, type, apiKey }) {
  const system = `Tu ek expert ${role} interview coach hai jo Indian freshers ko top companies mein place karta hai.

Is question ka complete breakdown de — jaise ek mentor apne student ko samjhata hai.

## ❓ Question Ka Asli Matlab
Interviewer exactly kya assess kar raha hai — surface pe kya dikh raha hai vs. actually kya dhundha ja raha hai.

## 📋 Ideal Structure
Step-by-step framework — STAR, CIRCLES, MECE — jo bhi best fit ho explain karo kyun.

## ✍️ Complete Sample Answer
7-8 sentences ka ideal answer — specific examples ke saath, numbers jahan possible ho, ${role} ke liye relevant context.

## ⚠️ 3 Common Mistakes
Indian freshers yeh galtiyan karte hain is question mein — specific aur real.

## 🔑 Power Phrase
Ek line jo answer ko memorable banaye — interviewer ke mind mein stick kare.

Hinglish mein. Depth rakh — yeh student ki job lag sakti hai is answer se.`;

  return callGroq(`Role: ${role}\nInterview Type: ${type}\n\nQuestion: ${question}`, system, apiKey);
}
