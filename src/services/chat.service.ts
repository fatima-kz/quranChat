import { supabase, supabaseReady } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import type { Conversation, Message, Citation } from '@/types';

const LOCAL_CONVOS_KEY = '@quranchat:localConversations';
const LOCAL_MSGS_KEY = '@quranchat:localMessages';

async function getLocalConvos(): Promise<Conversation[]> {
  return (await storage.getJSON<Conversation[]>(LOCAL_CONVOS_KEY)) ?? [];
}
async function setLocalConvos(c: Conversation[]) {
  await storage.setJSON(LOCAL_CONVOS_KEY, c);
}
async function getLocalMsgs(): Promise<Record<string, Message[]>> {
  return (await storage.getJSON<Record<string, Message[]>>(LOCAL_MSGS_KEY)) ?? {};
}
async function setLocalMsgs(m: Record<string, Message[]>) {
  await storage.setJSON(LOCAL_MSGS_KEY, m);
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function listConversations(userId: string): Promise<Conversation[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Conversation[]) ?? [];
  }
  const convos = await getLocalConvos();
  return convos.filter((c) => c.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createConversation(userId: string, title: string): Promise<Conversation> {
  const conversation: Conversation = {
    id: uuid(),
    user_id: userId,
    title,
    created_at: new Date().toISOString(),
  };
  if (supabaseReady && supabase) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: userId, title })
      .select()
      .single();
    if (error) throw error;
    return data as Conversation;
  }
  const convos = await getLocalConvos();
  convos.unshift(conversation);
  await setLocalConvos(convos);
  return conversation;
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as Message[]) ?? [];
  }
  const all = await getLocalMsgs();
  return all[conversationId] ?? [];
}

export async function insertMessage(
  conversationId: string,
  role: Message['role'],
  content: string,
  citation: Citation | null,
): Promise<Message> {
  const message: Message = {
    id: uuid(),
    conversation_id: conversationId,
    role,
    content,
    citation,
    created_at: new Date().toISOString(),
  };
  if (supabaseReady && supabase) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        citation: citation as any,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Message;
  }
  const all = await getLocalMsgs();
  const list = all[conversationId] ?? [];
  list.push(message);
  all[conversationId] = list;
  await setLocalMsgs(all);
  return message;
}

export async function renameConversation(conversationId: string, title: string): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId);
    if (error) throw error;
    return;
  }
  const convos = await getLocalConvos();
  const c = convos.find((x) => x.id === conversationId);
  if (c) c.title = title;
  await setLocalConvos(convos);
}

export async function toggleBookmark(userId: string, message: Message): Promise<boolean> {
  if (supabaseReady && supabase) {
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('message_id', message.id)
      .maybeSingle();
    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', (existing as any).id);
      return false;
    }
    await supabase.from('bookmarks').insert({ user_id: userId, message_id: message.id });
    return true;
  }
  return !message.bookmarked;
}
