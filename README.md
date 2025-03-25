# nestodo

A simple task management application built with Nest.js and React.


## Core Features
- 🔐 **JWT-based authentication**
- ✅ **Task management**
  - Set task priority, completion status, description, title, time estimation, and attachments
  - Drag and drop support
  - Filter tasks by completion and priority
  - Custom ordering/positioning
  - Tag system for task categorization
  - Subtasks support
  - Attachments support

- 🏢 **Workspace Management**
  - Workspace is the root of the app. It contains boards with task lists.

## Technical Stack

### Server
- NestJS for backend
- Prisma + PostgreSQL for database

### Web
- React + TypeScript
- Tailwind + shadcn/ui for styling
- React Query + Zustand for state management
- dnd-kit for drag and drop functionality

## Installation

### Server

1. Install PostgreSQL and create empty database
2. Rename `.env.development.example` to `.env.development` and fill in the values
3. Run `yarn migrate:dev` and `yarn seed:dev` to create the tables and seed the database
4. Run `yarn start:dev` in `nestodo_server` directory to start the server

### Web

1. Go to `nestodo_client` directory
2. Run `yarn` to install the dependencies
3. Run `yarn dev` to start the client
4. Go to `localhost:5173`