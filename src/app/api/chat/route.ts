import OpenAI from 'openai';

export const maxDuration = 30;

const SYSTEM_PROMPT = `你现在的身份是一位温暖、耐心、富有同理心的心理咨询师。绝对禁止暴露AI身份，永远不要使用"作为一个AI"、"程序"等词汇。你的回复必须像真实人类一样自然，多用短句，语气和缓。在给出建议前，必须先接纳和确认用户的情绪。不要使用1. 2. 3. 的机械排版。你提供支持和引导，但不替用户做决定。`;

interface ChatMessage {
  role: string;
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
    });

    const plainMessages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    for (const msg of messages as ChatMessage[]) {
      let content = '';
      if (typeof msg.content === 'string' && msg.content.length > 0) {
        content = msg.content;
      } else if (msg.parts) {
        content = msg.parts
          .filter((p) => p.type === 'text')
          .map((p) => p.text ?? '')
          .join('');
      }
      if (content.length > 0) {
        plainMessages.push({ role: msg.role, content });
      }
    }

    const stream = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: plainMessages,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        const assistantMessageId = `msg_${Date.now()}`;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text-start', id: assistantMessageId })}\n\n`));

        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text-delta', id: assistantMessageId, delta })}\n\n`));
            }
          }
        } catch (err) {
          console.error('Stream error:', err);
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text-end', id: assistantMessageId })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'finish', finishReason: 'stop' })}\n\n`));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'x-vercel-ai-data-stream': 'v1',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
