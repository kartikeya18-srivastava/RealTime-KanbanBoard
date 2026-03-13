# Real-Time Collaborative Kanban Board

A highly interactive, multi-user project board featuring instant synchronization, optimistic UI updates, and version-based conflict detection.

## 🚀 Features

- **Real-Time Sync**: Changes reflect instantly across all connected clients via Socket.io.
- **Optimistic UI**: Zero latency; UI updates immediately and rolls back if the server detects a version conflict.
- **Conflict Detection**: Version-based optimistic locking prevents state corruption during concurrent edits.
- **Rich Card Details**: Markdown support, labels, due dates, and assignees.
- **Inline Editing**: Quick column title edits directly on the board.
- **Presence Indicators**: Live "Someone is typing..." badges and active user avatars.

## 🛠 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, @dnd-kit, Socket.io-client.
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.io.
- **Testing**: Jest, Supertest.

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via Atlas)

### Installation & Run

1. **Clone & Setup**:
   ```bash
   git clone <repo-url>
   cd RealTime-KanbanBoard
   ```

2. **Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 🧪 Running Tests
```bash
cd server
npm test
```

## 🏗️ Architecture & Data Model

### ERD Diagram (ASCII)
```text
+--------------+       +-----------------+       +--------------+
|     User     |       |    Workspace    |       |    Board     |
+--------------+       +-----------------+       +--------------+
| id (PK)      |1    * | id (PK)         |1    * | id (PK)      |
| email        +-------+ name            +-------+ workspaceId  |
| passwordHash |       | slug (Unique)   |       | title        |
| displayName  |       +-------+---------+       | columnOrder[]|
| workspaces[] |               | 1               +-------+------+
+--------------+               |                         | 1
                               | *                       |
                       +-------+---------+       +-------+------+
                       |     Member      |       |    Column    |
                       +-----------------+       +--------------+
                       | userId (FK)     |       | id (PK)      |
                       | role            |       | boardId (FK) |
                       +-----------------+       | title        |
                                                 | cardOrder[]  |
                                                 +-------+------+
                                                         | 1
                                                         |
                                                 +-------+------+
                                                 |     Card     |
                                                 +--------------+
                                                 | id (PK)      |
                                                 | columnId (FK)|
                                                 | title        |
                                                 | description  |
| version (Lock)|
| labels[]      |
| dueDate       |
+--------------+
```

### Conflict Detection Strategy
We use **Optimistic Locking** with a `version` field on each Card. 
1. Client sends `clientVersion` with every update/move.
2. Server check: `if (clientVersion !== dbVersion) return rejected;`
3. If valid, server increments `version++` and broadcasts the new state.
4. Client reconciles: If rejected, the client rolls back to the server's truth and shows a toast.

## 📖 API Documentation

### Auth
- `POST /api/auth/register`: Create account.
- `POST /api/auth/login`: Get JWT & Refresh Token.
- `POST /api/auth/refresh`: Rotate access JWT.

### Workspaces
- `GET /api/workspaces`: List workspaces.
- `POST /api/workspaces`: Create workspace.
- `POST /api/workspaces/:id/invite`: Invite member (Owner only).

### Boards
- `GET /api/boards/:id`: Get board details (Full state sync).
- `POST /api/boards`: Create board.
- `DELETE /api/boards/:id`: Delete board (Cascade delete).

### Cards
- `POST /api/cards`: Create card.
- `PATCH /api/cards/:id`: Update card (Title, Description, Labels, etc.).
- `DELETE /api/cards/:id`: Delete card.

## 🔮 Future Considerations
- **Undo/Redo**: Command pattern for move history.
- **Search**: Fuzzy search across all boards in a workspace.
- **Attachments**: File upload support for cards.
