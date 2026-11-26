const facts = {
  letter_number: '104/DM/2026',
  letter_date: '20-11-2026',
  sender_name_designation: 'जिलाधिकारी',
  recipient_designation: 'अधिशासी अभियंता, जल निगम',
  subject: 'पेयजल आपूर्ति बाधित होने के संबंध में स्पष्टीकरण',
  deadline: '7 दिन',
  key_facts: [
    'जिलाधिकारी कार्यालय से पेयजल आपूर्ति बाधित होने की सूचना प्राप्त हुई।',
    'संबंधित क्षेत्र में आपूर्ति बहाली की स्थिति स्पष्ट की जानी है।',
    'कार्रवाई एवं समय-सीमा सहित स्पष्टीकरण अपेक्षित है।',
  ],
  missing_enclosures: 'None',
}

const draft = `पत्रावली सं. 42/2026/प्रशासन

कार्यालय: ____________________
दिनांक: [दिनांक]

प्रेषक,
जिलाधिकारी,
____________________।

सेवा में,
अधिशासी अभियंता,
जल निगम, ____________________।

विषय: पेयजल आपूर्ति बाधित होने के संबंध में स्पष्टीकरण।

संदर्भ: जिलाधिकारी कार्यालय का पत्र सं. 104/DM/2026, दिनांक 20-11-2026।

महोदय,

1. उपर्युक्त विषयक संदर्भित पत्र के क्रम में अवगत कराना है कि संबंधित क्षेत्र में पेयजल आपूर्ति बाधित होने की सूचना प्राप्त हुई है।

2. कृपया आपूर्ति बाधित होने के कारणों, अब तक की गई कार्रवाई तथा आपूर्ति बहाली की वर्तमान स्थिति से अवगत कराएं।

3. इस संबंध में अपना तथ्यात्मक स्पष्टीकरण एवं प्रस्तावित कार्रवाई की समय-सीमा इस पत्र के प्राप्त होने के 7 दिन के भीतर उपलब्ध कराना सुनिश्चित करें।

भवदीय,

([अधिकारी का नाम])
[पदनाम]
कार्यालय: [कार्यालय का नाम]`

const successfulTrace = [
  { agent: 'Sandarbh (संदर्भ)', status: 'completed', detail: 'आवक पत्र से संदर्भ और प्रमुख तथ्य निकाले गए।' },
  { agent: 'Prabandhak (प्रबंधक)', status: 'completed', detail: 'विषय और निर्देश के अनुसार शासकीय पत्र चुना गया।' },
  { agent: 'Lekhan (लेखन)', status: 'completed', detail: 'उपलब्ध तथ्यों के आधार पर मसौदा तैयार किया गया।' },
  { agent: 'Samiksha (समीक्षा)', status: 'verified', detail: 'प्रारूप और तथ्य संबंधी जांच पूरी हुई।' },
]

const seededThreads = [
  {
    thread_id: 'FILE-679AC6',
    file_number: 'पत्रावली सं. 42/2026/प्रशासन',
    subject: 'जिलाधिकारी कार्यालय से प्राप्त पेयजल आपूर्ति बाधित होने के संबंध में',
    extracted_facts: facts,
    updated_at: '2026-11-25T15:58:51.900565',
    messages: [
      {
        role: 'user',
        text: 'इस पत्र पर 7 दिन में स्पष्टीकरण हेतु शासकीय पत्र तैयार करें।',
        timestamp: '2026-11-25T15:58:51.900565',
      },
      {
        role: 'assistant',
        text: 'संदर्भित पत्र के आधार पर शासकीय पत्र का प्रारूप चुना गया है।',
        format_type: 'Official Letter (शासकीय पत्र)',
        urgency: 'सामान्य (Normal)',
        summary: 'स्पष्टीकरण और कार्रवाई की समय-सीमा के लिए शासकीय पत्र उपयुक्त है।',
        draft_content: draft,
        extracted_facts: facts,
        audit: { passed: true, score: '10/10', checks: ['संदर्भ और विषय का मिलान', 'औपचारिक प्रारूप'] },
        agent_trace: successfulTrace,
        timestamp: '2026-11-25T15:59:01.900565',
        duration_seconds: 9.4,
      },
    ],
  },
  {
    thread_id: 'FILE-103B8F',
    file_number: 'पत्रावली सं. 18/2026/स्थापना',
    subject: 'कार्यालय में अभिलेख अद्यतन किए जाने के संबंध में',
    extracted_facts: {},
    updated_at: '2026-11-24T11:30:00',
    messages: [
      {
        role: 'user',
        text: 'संबंधित शाखा को अभिलेख अद्यतन करने हेतु निर्देशित करें।',
        timestamp: '2026-11-24T11:30:00',
      },
      {
        role: 'assistant',
        text: 'निर्देश के अनुरूप कार्यालय ज्ञापन का प्रारूप तैयार किया गया है।',
        format_type: 'Office Memorandum',
        urgency: 'सामान्य (Normal)',
        summary: 'कार्यालयीन निर्देश साझा करने हेतु कार्यालय ज्ञापन उपयुक्त है।',
        draft_content: `कार्यालय ज्ञापन\n\nविषय: कार्यालय में अभिलेख अद्यतन किए जाने के संबंध में।\n\nसभी संबंधित कर्मचारियों को निर्देशित किया जाता है कि कार्यालयीन अभिलेखों का परीक्षण कर आवश्यक अद्यतन करें। पूर्णता की सूचना [तिथि] तक प्रस्तुत करें।\n\n[हस्ताक्षर]\n[पदनाम]`,
        extracted_facts: {},
        audit: { passed: true, score: '9/10', checks: ['प्रारूप जांच पूर्ण'] },
        agent_trace: successfulTrace.slice(1),
        timestamp: '2026-11-24T11:30:08',
        duration_seconds: 8,
      },
    ],
  },
]

let threads = structuredClone(seededThreads)
let nextThread = 1

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function listThreads() {
  await wait(3000)
  return { threads: structuredClone(threads) }
}

export async function processDraft(request) {
  await wait(3000)
  const threadId = request.thread_id || `FILE-DEMO${String(nextThread++).padStart(2, '0')}`
  const existing = threads.find((thread) => thread.thread_id === threadId)
  const response = {
    thread_id: threadId,
    file_number: request.file_number || existing?.file_number || 'पत्रावली सं. 42/2026/प्रशासन',
    subject: existing?.subject || 'पेयजल आपूर्ति बाधित होने के संबंध में स्पष्टीकरण',
    format_type: 'Official Letter (शासकीय पत्र)',
    urgency: 'सामान्य (Normal)',
    summary: 'निर्देश और उपलब्ध संदर्भ के अनुसार शासकीय पत्र का प्रारूप चुना गया है।',
    draft_content: draft,
    extracted_facts: request.file_name ? facts : {},
    audit: { passed: true, score: '10/10', checks: ['प्रारूप संबंधी जांच पूरी', 'उपलब्ध तथ्यों की जांच पूरी'] },
    agent_trace: request.file_name ? successfulTrace : successfulTrace.slice(1),
  }
  const userMessage = {
    role: 'user',
    text: request.user_message,
    attachment_name: request.file_name || '',
    timestamp: new Date().toISOString(),
  }
  const assistantMessage = { role: 'assistant', ...response, timestamp: new Date().toISOString() }
  const thread = existing || {
    thread_id: threadId,
    file_number: response.file_number,
    subject: response.subject,
    messages: [],
    extracted_facts: {},
  }
  thread.messages = [...(thread.messages || []), userMessage, assistantMessage]
  thread.extracted_facts = response.extracted_facts
  thread.updated_at = assistantMessage.timestamp
  if (!existing) threads = [thread, ...threads]
  return response
}
