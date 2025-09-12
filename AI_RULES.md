# AI Rules for Skoropad Application Development

This document outlines the core technologies used in the Skoropad application and provides guidelines for using specific libraries and frameworks.

## Tech Stack Overview

*   **React**: A JavaScript library for building user interfaces.
*   **TypeScript**: A superset of JavaScript that adds static typing, enhancing code quality and maintainability.
*   **Vite**: A fast build tool that provides a quick development server and optimized builds for production.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS.
*   **React Router DOM**: For declarative client-side routing within the application.
*   **Supabase**: A backend-as-a-service providing database, authentication, and file storage capabilities.
*   **@tanstack/react-query**: A powerful library for managing, caching, and synchronizing server state in React applications.
*   **Framer Motion**: A production-ready motion library for React, used for animations and interactive elements.
*   **Lucide React**: A library providing a set of beautiful, customizable SVG icons.
*   **Sonner**: A modern toast component for displaying notifications.
*   **React Hook Form & Zod**: Libraries for efficient form management and schema-based validation.

## Library Usage Rules

To maintain consistency and leverage the strengths of each library, please adhere to the following guidelines:

*   **UI Components**: Always prioritize `shadcn/ui` components for building the user interface. If a required component is not available in `shadcn/ui` or needs significant customization, create a new component in `src/components/` and style it using Tailwind CSS. **Do not modify files within `src/components/ui` directly.**
*   **Styling**: Use Tailwind CSS exclusively for all styling. Avoid inline styles or custom CSS files unless absolutely necessary for highly specific, isolated cases.
*   **Routing**: All client-side navigation should be handled using `react-router-dom`. Define the main application routes in `src/App.tsx`.
*   **State Management & Data Fetching**: For managing server-side data and complex asynchronous operations, use `@tanstack/react-query`. For simple, local component state, `useState` and `useReducer` are appropriate.
*   **Backend Interactions**: Interact with the database, authentication, and storage services via the `supabase` client provided at `@/integrations/supabase/client.ts`.
*   **Animations**: Implement all animations and transitions using `framer-motion` to ensure a smooth and consistent user experience.
*   **Icons**: Use icons from the `lucide-react` library.
*   **Form Handling**: For forms, use `react-hook-form` for state management and `zod` with `@hookform/resolvers` for schema-based validation.
*   **Toast Notifications**: Display all user feedback and notifications using the `sonner` toast component.
*   **Utility Functions**: For conditionally applying and merging Tailwind CSS classes, use the `cn` utility function from `src/lib/utils.ts`.