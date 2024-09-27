'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { createChatLLMService } from '~/home/[account]/chat/_lib/server/chat-llm.service';

import { ReferenceIdSchema } from '../schema/reference-id.schema';
import { RenameChatSchema } from '../schema/rename-chat.schema';
import { UpdateChatSchema } from '../schema/update-chat.schema';
import { createChatMessagesService } from './chat-messages.service';

const CreateChatSchema = z.object({
  content: z.string().min(1).max(2000),
  accountId: z.string().uuid(),
  referenceId: ReferenceIdSchema,
});

export const createChatAction = enhanceAction(
  async (body) => {
    const client = getSupabaseServerActionClient();
    const adminClient = getSupabaseServerActionClient({ admin: true });

    const service = createChatMessagesService(client as any);
    const chatService = createChatLLMService(client as any, adminClient as any);

    try {
      const chatName = await chatService.createChatNameFromMessage({
        message: body.content,
        accountId: body.accountId,
      });

      await service.createChat({
        accountId: body.accountId,
        chatReferenceId: body.referenceId,
        name: chatName,
        messages: [],
      });

      revalidatePath('/home/[account]/chat', 'layout');

      return {
        success: true,
        message: null,
      };
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : 'chats:errorCreatingChat',
      };
    }
  },
  {
    schema: CreateChatSchema,
  },
);

export const deleteChatAction = enhanceAction(async (data: FormData) => {
  const chatReferenceId = data.get('chatReferenceId') as string;

  if (!chatReferenceId) {
    throw new Error('Chat reference ID is required');
  }

  const client = getSupabaseServerActionClient();
  const service = createChatMessagesService(client as any);

  await service.deleteChat({ chatReferenceId });

  revalidatePath('/home/[account]/chat', 'layout');

  return redirect('../chat');
}, {});

export const renameChatAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerActionClient();
    const service = createChatMessagesService(client as any);

    await service.updateChat({
      chatReferenceId: data.referenceId,
      name: data.name,
    });

    revalidatePath('/home/[account]/chat/[referenceId]', 'page');

    return {
      success: true,
    };
  },
  {
    schema: RenameChatSchema,
  },
);

export const updateChatSettingsAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerActionClient();
    const service = createChatMessagesService(client as any);

    await service.updateChat({
      chatReferenceId: data.referenceId,
      settings: data.settings,
    });

    return {
      success: true,
    };
  },
  {
    schema: UpdateChatSchema,
  },
);
