-- ============================================================================
-- Link Documents to Chat Sessions
-- Date: 2025-10-20
-- Purpose: Create junction table for linking chat sessions to accessible documents
-- ============================================================================

-- Create junction table for linking chat sessions to documents (sources)
create table if not exists chat_session_documents (
  id uuid primary key default uuid_generate_v4(),
  chat_session_id uuid not null references chat_sessions(id) on delete cascade,
  source_id uuid not null references sources(id) on delete cascade,
  added_at timestamp with time zone default now(),
  added_by_user_id uuid references auth.users(id),
  unique(chat_session_id, source_id)
);

-- Enable RLS
alter table chat_session_documents enable row level security;

-- Policy: Users can view links for their own chat sessions
create policy "Users can view own chat session documents"
on chat_session_documents
for select
to authenticated
using (
  chat_session_id in (
    select id from chat_sessions
    where user_id = (select auth.uid())
  )
);

-- Policy: Users can link documents they have access to
create policy "Users can link accessible documents"
on chat_session_documents
for insert
to authenticated
with check (
  -- User owns the chat session
  chat_session_id in (
    select id from chat_sessions
    where user_id = (select auth.uid())
  )
  and
  -- User has access to the source (RLS will check)
  exists (
    select 1 from sources
    where id = source_id
  )
);

-- Policy: Users can remove document links from their chats
create policy "Users can unlink documents from own chats"
on chat_session_documents
for delete
to authenticated
using (
  chat_session_id in (
    select id from chat_sessions
    where user_id = (select auth.uid())
  )
);

-- Add indexes for performance
create index idx_chat_session_documents_session_id
on chat_session_documents(chat_session_id);

create index idx_chat_session_documents_source_id
on chat_session_documents(source_id);

-- Add comments
comment on table chat_session_documents is 'Junction table linking chat sessions to source documents for context';
comment on column chat_session_documents.chat_session_id is 'Reference to the chat session';
comment on column chat_session_documents.source_id is 'Reference to the source document';
comment on column chat_session_documents.added_at is 'When the document was linked to this chat';
comment on column chat_session_documents.added_by_user_id is 'User who linked the document';
