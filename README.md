SpaceLearn - Spaced Repetition Learning Tool

SpaceLearn is a modern web application designed to help users master new concepts using the Spaced Repetition System (SRS). It utilizes a custom implementation of the SuperMemo-2 (SM-2) algorithm to optimize review intervals and maximize retention.

🌟 Features

Smart Review Algorithm: Implementation of the SM-2 algorithm to calculate optimal review dates based on user performance.

Concept Management: Create, categorize, and organize learning materials.

Progress Tracking: Visual statistics for daily dues, learned items, and total progress.

Daily Motivation: Integrated quote system to keep you motivated during study sessions.

Responsive Design: Fully responsive UI with dark/light mode support.

🛠️ Tech Stack

This project was built using a modern, type-safe stack:

Framework: Next.js 15 (App Router)

Language: TypeScript 5

Styling: Tailwind CSS 4 & shadcn/ui

Database: SQLite (via Prisma ORM)

State Management: React Hooks & local state

Validation: Zod & React Hook Form

🚀 Getting Started

Prerequisites

Node.js (v18 or higher)

npm or pnpm

Installation

Clone the repository:
```
git clone [https://github.com/yourusername/space-learn.git](https://github.com/yourusername/space-learn.git)
cd space-learn
```

Install dependencies:
```
npm install
```

Initialize the database:
```
npm run db:push
npm run db:generate
```

Run the development server:

```
npm run dev
```


Open http://localhost:3000 with your browser to see the result.

📄 License

This project is licensed under the MIT License.
