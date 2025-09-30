# A.I.M (App Idea Manager)/(Artificial Intelligence mSiteGenerator)

A web app that takes natural language app ideas and generates structured requirements (App Name, Entities, Roles, Features) for site preview purposes.

Includes:
- Editable roles/entities tables
- Sidebar with history (MongoDB)
- Requirements preview page with mock UI

Created with Node.js, React, and MongoDB integration, for internship with Decoded Digital.

---

## Getting Started

### Prerequisites
- Node.js (>=18)
- npm
- A MongoDB instance (Atlas preferred, with connection string.)
- OpenAI API key

---

### Installation

Clone the repo:

```bash
git clone https://github.com/HenryRolleston/AIm_Dist.git
cd AIm_Dist
```

Install dependencies (while in AIm Directory):
```
npm install
```
Environment Variables

Create a .env file in backend/ with:
```
MONGO_URI=your-mongodb-uri
DB_NAME=your-db-name
OPENAI_API_KEY=your-api-key
```

### Running Locally

Run from root directory:
```
npm run dev
```

App will be available at:

http://localhost:5173
