-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.documents (
  id bigint NOT NULL DEFAULT nextval('documents_id_seq'::regclass),
  content text,
  metadata jsonb,
  embedding USER-DEFINED,
  policyType text,
  policyDate text,
  policyName text,
  source_id uuid,
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.sources(id)
);
CREATE TABLE public.n8n_chat_histories (
  id integer NOT NULL DEFAULT nextval('n8n_chat_histories_id_seq'::regclass),
  session_id uuid NOT NULL,
  message jsonb NOT NULL,
  CONSTRAINT n8n_chat_histories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  notebook_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  source_type text DEFAULT 'user'::text,
  extracted_text text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_policy_document_id_fkey FOREIGN KEY (notebook_id) REFERENCES public.policy_documents(id)
);
CREATE TABLE public.policy_documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  color text DEFAULT 'gray'::text,
  icon text DEFAULT '📝'::text,
  generation_status text DEFAULT 'completed'::text,
  example_questions ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  role_assignment text CHECK (role_assignment = ANY (ARRAY['administrator'::text, 'executive'::text, 'board'::text])),
  CONSTRAINT policy_documents_pkey PRIMARY KEY (id),
  CONSTRAINT notebooks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.sources (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  notebook_id uuid NOT NULL,
  title text NOT NULL,
  type USER-DEFINED NOT NULL,
  url text,
  file_path text,
  file_size bigint,
  display_name text,
  content text,
  summary text,
  processing_status text DEFAULT 'pending'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  visibility_scope text DEFAULT 'notebook'::text CHECK (visibility_scope = ANY (ARRAY['notebook'::text, 'role'::text, 'global'::text])),
  target_role text CHECK ((target_role = ANY (ARRAY['administrator'::text, 'executive'::text, 'board'::text])) OR target_role IS NULL),
  uploaded_by_user_id uuid,
  policyType text,
  policyDate text,
  policyName text,
  CONSTRAINT sources_pkey PRIMARY KEY (id),
  CONSTRAINT sources_policy_document_id_fkey FOREIGN KEY (notebook_id) REFERENCES public.policy_documents(id),
  CONSTRAINT sources_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['administrator'::text, 'executive'::text, 'board'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);