
# PolicyAi: AI-Powered Policy Management and Compliance Q&A System

> Transform your organizational policy management with AI-powered intelligence. PolicyAi helps organizations manage, search, and get instant answers from their policy documents through an intelligent Q&A interface.

**PolicyAi** is a specialized application designed to help administrators and executives navigate complex organizational policies with AI-powered search and question-answering capabilities. It provides a centralized platform for policy document management with advanced RAG (Retrieval-Augmented Generation) technology to ensure accurate, source-grounded responses.

**Status**: v1.0-beta (Core features functional)
**Last Updated**: 2026-02-27

---

## 🎯 About The Project

PolicyAi addresses the critical challenge organizations face in managing and accessing their policy documents effectively. Traditional policy management often results in scattered documents, inconsistent interpretations, and difficulty finding relevant information when needed.

This application provides a centralized, AI-powered solution that transforms how organizations interact with their policies. Built with modern web technologies and powered by advanced RAG capabilities, PolicyAi ensures that policy-related questions receive accurate, source-backed answers.

The system is designed to be self-hostable and customizable, allowing organizations to maintain complete control over their sensitive policy data while benefiting from cutting-edge AI assistance.

---

## ✨ Key Features (Currently Working)

### Core Functionality
* **📤 Document Upload Pipeline**: Drag-and-drop PDF upload with real-time processing status
* **🔄 Automated Document Processing**: N8N-powered workflow extracts text, metadata, and generates summaries
* **📄 PDF Document Viewer**: Built-in PDF viewer with page navigation and zoom controls
* **💬 AI-Powered Q&A**: Natural language chat interface powered by N8N workflows and OpenAI/Gemini
* **🔒 Role-Based Access Control**: Three user roles (Board Member, Administrator, Executive) with strict data segregation
* **✅ Verifiable Citations**: Every AI response includes source document references
* **⚡ Real-Time Updates**: Live status updates via Supabase Realtime subscriptions

### Security & Data Management
* **🛡️ Row-Level Security (RLS)**: Database-level access control enforced by PostgreSQL
* **🔐 Secure Authentication**: Supabase Auth with session management
* **🏠 Self-Hosted**: Complete control over your sensitive policy data
* **📊 Document Organization**: Organized by notebooks with metadata and status tracking

### What Makes PolicyAi Different
* Purpose-built for compliance and policy management
* Strict role-based access ensures data segregation
* AI responses always grounded in source documents
* Real-time processing status tracking
* Self-hostable for maximum security

---

## 🏗️ Architecture

PolicyAi uses a modern, serverless architecture:

```
┌─────────────┐
│   Browser   │ (React + TypeScript + Vite)
│  (Frontend) │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│        Supabase Platform        │
├─────────────────────────────────┤
│ • Authentication                │
│ • PostgreSQL Database (RLS)     │
│ • Storage (PDF files)           │
│ • Edge Functions                │
│ • Realtime Subscriptions        │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────┐
│ N8N Cloud   │ (Workflow Automation)
├─────────────┤
│ • Document Processing           │
│ • Text Extraction               │
│ • AI Chat                       │
│ • Metadata Extraction           │
└─────────────┘
```

**Key Technologies**:
- **Frontend**: React 18, TypeScript, Vite, shadcn/ui, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Workflows**: N8N (document processing, AI chat)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **AI**: OpenAI/Gemini (via N8N workflows)
- **PDF Rendering**: react-pdf

---

## 🚀 Getting Started

### Prerequisites

Before you begin, you'll need:
- **Node.js** (v18+) and npm
- **Supabase Account** (free tier available)
- **N8N Instance** (cloud or self-hosted)
- **OpenAI or Gemini API Key** (for AI functionality)
- **Git** for version control

---

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/policyai.git
cd policyai
npm install
```

---

### Step 2: Set Up Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Save your database password

2. **Run Database Migrations**
   ```bash
   npx supabase link --project-ref your-project-ref
   npx supabase db push --password your-database-password
   ```

3. **Configure Storage**
   - Create a storage bucket named `sources` (for PDF files)
   - RLS policies are automatically created by migrations

4. **Deploy Edge Functions**
   ```bash
   npx supabase functions deploy process-document
   npx supabase functions deploy process-document-callback
   ```

---

### Step 3: Configure N8N Workflows

1. **Import N8N Workflows**
   - Workflows are in `/n8n` directory
   - Import into your N8N instance
   - Configure Supabase credentials
   - Configure OpenAI/Gemini credentials

2. **Required Workflows**:
   - `document-processing.json` - Extracts text and metadata from PDFs
   - `chat.json` - Handles AI Q&A with RAG
   - `process-document-callback.json` - Updates database after processing

3. **Get Webhook URLs**
   - Each workflow exposes a webhook URL
   - Save these URLs for Supabase secrets

---

### Step 4: Configure Supabase Secrets

Add the following secrets in Supabase Dashboard (Project Settings → Edge Functions → Secrets):

```bash
DOCUMENT_PROCESSING_WEBHOOK_URL=https://your-n8n-instance.com/webhook/document-processing
NOTEBOOK_GENERATION_AUTH=your-auth-token
OPENAI_API_KEY=sk-...  # For edge functions that need direct AI access
```

---

### Step 5: Configure Environment Variables

Create `.env.local` in the project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

### Step 6: Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

### Step 7: Create First User

1. Sign up via the UI
2. Manually assign user role via Supabase SQL Editor:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('your-user-id', 'administrator');
   ```

---

## 📖 Usage

### For Administrators

1. **Upload Documents**
   - Navigate to Dashboard
   - Click "Upload Documents"
   - Drag and drop PDF files
   - Wait for processing to complete

2. **Assign Document Roles**
   - Select a document
   - Choose target role (Administrator, Executive, Board)
   - Save changes

3. **Monitor Processing**
   - Real-time status updates
   - Processing → Completed → Ready for chat

### For All Users

1. **Ask Questions**
   - Navigate to Chat
   - Type natural language questions
   - Receive AI-generated answers with citations

2. **View PDFs**
   - Click on any document
   - View PDF in built-in viewer
   - Navigate pages, zoom, search

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Current Features](docs/current/features-implemented.md)** - What's actually implemented
- **[Known Issues](docs/current/known-issues.md)** - Active bugs and workarounds
- **[Architecture](docs/architecture/index.md)** - Technical architecture details
- **[User Stories](docs/stories/)** - Development roadmap
- **[QA Assessments](docs/qa/assessments/)** - Test plans and coverage

**Quick Links**:
- [Setup Guide](docs/guides/setup-guide.md) - Detailed setup instructions
- [Troubleshooting](docs/guides/troubleshooting-guide.md) - Common issues and solutions
- [Project Status](docs/project-management/current-status.md) - Current development status

---

## 🔧 Development

### Project Structure

```
policyai/
├── src/                    # React application source
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts (Auth, etc.)
│   └── integrations/      # Supabase client
├── supabase/
│   ├── functions/         # Edge functions
│   ├── migrations/        # Database migrations
│   └── scripts/           # Utility SQL scripts
├── n8n/                   # N8N workflow definitions
├── docs/                  # Documentation
└── public/                # Static assets
```

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Lint code
```

### Database Migrations

```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push --password your-password

# Reset database (destructive!)
npx supabase db reset
```

---

## 🐛 Known Issues

No active bugs at this time. See [docs/current/known-issues.md](docs/current/known-issues.md) for recently fixed issues.

**Recently Fixed (HHR-173)**:
- ~~File size displays as "NaN MB" during upload~~ — Fixed with `formatFileSize` helper
- ~~Slow document list loading with 10+ documents~~ — Fixed with `.range()` limit + DB index
- ~~Document visibility delay after upload~~ — Fixed with React Query cache invalidation

---

## 🗺️ Roadmap

PolicyAi is under active development. Current focus areas:

**Completed** ✅:
- Core document upload and processing pipeline
- PDF viewer with basic navigation
- Role-based access control (3 roles)
- Real-time status updates
- AI-powered chat with citations

**Recently Completed** ✅:
- Upload visibility and cache invalidation fixes (HHR-173)
- Document loading performance optimization with DB indexes (HHR-173)
- Word template library and avatar upload (HHR-172)
- User management error message improvements (HHR-172)

**Planned** 📋:
- Enhanced PDF features (search, thumbnails, citation highlighting)
- 5-role hierarchy (add Company Operator, System Owner roles)
- API key management UI
- Token usage tracking and monitoring
- Settings hub for configuration

See [docs/current/features-implemented.md](docs/current/features-implemented.md) for detailed feature status.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the Project**
   ```bash
   git clone https://github.com/yourusername/policyai.git
   cd policyai
   git checkout -b feature/AmazingFeature
   ```

2. **Make Changes**
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

3. **Submit Pull Request**
   ```bash
   git commit -m 'Add some AmazingFeature'
   git push origin feature/AmazingFeature
   ```
   - Open a pull request on GitHub
   - Describe your changes clearly
   - Link related issues

**Contribution Guidelines**:
- Follow TypeScript and React best practices
- Maintain database RLS policies for security
- Add tests for new features
- Update documentation for user-facing changes

---

## 🔐 Security

PolicyAi takes security seriously:

- **Database-Level Security**: All data access controlled by PostgreSQL RLS
- **Role-Based Access**: Strict separation between user roles
- **Secure Authentication**: Supabase Auth with session management
- **Self-Hostable**: No third-party data access
- **API Key Protection**: Secrets stored in Supabase, never in code

**Reporting Security Issues**:
Please report security vulnerabilities to [security@yourorg.com](mailto:security@yourorg.com)

---

## 📄 License

This project is distributed under the MIT License. See `LICENSE` file for details.

---

## ⚖️ A Note on n8n's Sustainable Use License

PolicyAi uses n8n for workflow automation. n8n is distributed under a [Sustainable Use License](https://github.com/n8n-io/n8n/blob/master/LICENSE.md).

**Key Points**:
- ✅ **Free for internal business use** (hosting workflows within your company)
- ⚠️ **Commercial SaaS may require license** (reselling access, hosting for multiple clients)
- 📖 **Review the license** if your use case is commercial

**Alternative**: Convert N8N workflows to Supabase Edge Functions if needed.

---

## 🙏 Acknowledgments

PolicyAi evolved from the [InsightsLM](https://github.com/theaiautomators/insights-lm-public) project by The AI Automators. We're grateful for their foundational work.

**Key Technologies**:
- [Supabase](https://supabase.com) - Backend infrastructure
- [N8N](https://n8n.io) - Workflow automation
- [React](https://react.dev) - Frontend framework
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [OpenAI](https://openai.com) / [Gemini](https://ai.google.dev) - AI models

---

## 📞 Support & Community

**Need Help?**
- 📖 Check [Documentation](docs/)
- 🐛 Report bugs via [GitHub Issues](https://github.com/yourusername/policyai/issues)
- 💬 Join [The AI Automators Community](https://www.theaiautomators.com/)

**Resources**:
- [Setup Guide](docs/guides/setup-guide.md)
- [Troubleshooting](docs/guides/troubleshooting-guide.md)
- [Known Issues](docs/current/known-issues.md)
- [Architecture](docs/architecture/index.md)

---

## 📊 Project Status

**Version**: v1.0-beta
**Status**: Core features functional, active development
**Last Updated**: 2026-02-27

**What's Working**:
- ✅ Document upload and processing
- ✅ PDF viewer
- ✅ AI-powered chat
- ✅ Role-based access control
- ✅ Real-time updates

**What's Planned**:
- Enhanced PDF features
- Settings and administration UI
- Token usage tracking
- Advanced chat features

See [docs/project-management/current-status.md](docs/project-management/current-status.md) for detailed status.

---

**Built with ❤️ for compliance and policy professionals**

