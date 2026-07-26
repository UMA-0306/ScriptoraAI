# ScriptoraAI

**AI-Powered Collaborative Narrative Planning Platform**

ScriptoraAI is a production-grade collaborative workspace designed for screenwriters, novelists, content creators, and creative teams. It combines structured story planning, real-time collaboration, and AI-powered narrative assistance to streamline the creation of long-form content while ensuring consistency across characters, plots, and story arcs.

---

## Overview

ScriptoraAI provides a unified platform where creators can:

- Plan and organize stories using a structured hierarchy.
- Collaborate with multiple writers in real time.
- Generate outlines, scenes, and dialogue with AI assistance.
- Maintain consistency across characters, timelines, and world-building.
- Store and retrieve narrative context using semantic memory.

---

## Problem Statement

Long-form storytelling presents several challenges:

- Managing stories across multiple documents and tools.
- Maintaining consistency in characters, locations, and timelines.
- Collaborating efficiently with multiple contributors.
- Overcoming creative blocks during writing.
- Retrieving previous story context while drafting new content.

Existing writing platforms provide document editing or AI assistance independently but lack an integrated solution focused on collaborative narrative development.

---

## Solution

ScriptoraAI addresses these challenges by providing a centralized AI-powered workspace that enables users to:

- Organize projects into stories, acts, chapters, and scenes.
- Collaborate seamlessly with multiple writers.
- Generate and refine narrative content using AI.
- Detect continuity issues and plot inconsistencies.
- Maintain persistent narrative memory for context-aware assistance.

---

## Key Features

### Narrative Workspace

- Rich text editor for long-form writing
- Structured project organization
- Version history and document management

### Real-Time Collaboration

- Multi-user collaborative editing
- Live synchronization
- Shared project workspaces

### Story Management

- Story hierarchy management
- Character profiles
- Story arcs
- Locations and world-building
- Timeline organization

### AI Narrative Assistant

- Story planning and outlining
- Scene and dialogue generation
- Writing enhancement
- Narrative consistency analysis
- Context-aware content generation

### Narrative Memory

- Semantic document retrieval
- Long-term context preservation
- Character and plot memory
- Retrieval-Augmented Generation (RAG)

---

## System Architecture

```text
                Client
                   │
                   ▼
        Next.js Frontend
                   │
      REST API / WebSockets
                   │
                   ▼
          NestJS Backend
                   │
        PostgreSQL + Prisma
                   │
                   ▼
         FastAPI AI Service
                   │
       Gemini / OpenAI Models
                   │
                   ▼
              pgvector
```

---

## Technology Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Tiptap Editor
- Socket.IO Client
- Yjs

### Backend

- NestJS
- Prisma ORM
- PostgreSQL
- Socket.IO

### AI Services

- FastAPI
- LangChain
- LangGraph
- Gemini API / OpenAI API
- pgvector

### Deployment

- Vercel
- Railway / Render

---

## Project Structure

```text
scriptora-ai
│
├── frontend
│   ├── app
│   ├── components
│   ├── editor
│   └── dashboard
│
├── backend
│   ├── src
│   ├── prisma
│   ├── websocket
│   └── auth
│
├── ai-service
│   ├── agents
│   ├── planner
│   ├── memory
│   ├── consistency
│   └── api
│
└── docs
```

---

## Core Modules

### Authentication

- User registration
- Secure authentication
- Role-based authorization

### Dashboard

- Project overview
- Recent activity
- Progress tracking
- Collaboration insights

### Narrative Editor

- Rich text editing
- Scene management
- Story organization

### Character & World Management

- Character profiles
- Relationships
- Locations
- World-building assets

### AI Services

- Story Planner
- Prose Generator
- Consistency Checker
- Narrative Memory

---

## AI Workflow

```text
User Input
     │
     ▼
Document Processing
     │
     ▼
Embedding Generation
     │
     ▼
Vector Storage (pgvector)
     │
     ▼
Context Retrieval
     │
     ▼
LLM Processing
     │
     ▼
AI-Assisted Response
```

---

## Real-World Applications

ScriptoraAI is designed for:

- Screenwriters
- Novelists
- Creative writing teams
- Content creators
- Film and television studios
- Game narrative designers
- Educational storytelling platforms

---

## Future Enhancements

- AI storyboard generation
- Voice-to-script conversion
- Interactive story timelines
- Character relationship visualization
- Multi-language support
- Mobile application
- Offline collaboration
- Publishing integrations
- AI-generated illustrations

---

## Roadmap

- User Authentication
- Narrative Workspace
- Real-Time Collaboration
- AI Story Planner
- Narrative Memory
- Consistency Engine
- Deployment & Production Release

---

## Project Status

**Status:** In Development

ScriptoraAI is currently being developed with a focus on delivering a scalable, AI-native collaborative writing platform for long-form storytelling.

---

## Author

**Uma Durgeswari**

Computer Science Engineering Student | Full Stack Developer | AI Enthusiast

GitHub: **https://github.com/UMA-0306**
