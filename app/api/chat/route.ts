import { StreamingTextResponse } from 'ai';


import { enhanceRouteHandler } from '@/packages/next/src/routes';
import { getSupabaseServerClient } from '@/packages/supabase/src/clients/server-client';
import { getSupabaseServerAdminClient } from '@/packages/supabase/src/clients/server-admin-client';
import { createChatLLMService, StreamResponseSchema } from '@/lib/server/chat-llm.service';

export const dynamic = 'force-dynamic';

let FAKE_STREAMER = false;

if (process.env.NODE_ENV === 'production') {
  FAKE_STREAMER = false;
}

export const POST = enhanceRouteHandler(
  async ({ body, params }) => {
    if (FAKE_STREAMER) {
      return new StreamingTextResponse(fakeDataStreamer());
    }

    const client = getSupabaseServerClient();

    const adminClient = getSupabaseServerAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = createChatLLMService(client as any, adminClient as any);
    const referenceId = params.referenceId as string;

    try {
      return await service.streamResponse(body, referenceId);
    } catch (error) {
      console.error(error);

      const message = error instanceof Error ? error.message : 'Unknown error';

      return new Response(message, { status: 500 });
    }
  },
  {
    schema: StreamResponseSchema,
  },
);

function fakeDataStreamer() {
  let timerId: number | undefined;
  const encoder = new TextEncoder();
  let closed = false;

  return new ReadableStream({
    start(controller) {
      timerId = setInterval(() => {
        if (closed) return;

        controller.enqueue(encoder.encode('TEXT'));
      }, 200) as unknown as number;

      setTimeout(() => {
        controller.close();
        closed = true;
      }, 5_000);
    },
    cancel() {
      if (typeof timerId === 'number') {
        clearInterval(timerId);
      }
    },
  });
}
