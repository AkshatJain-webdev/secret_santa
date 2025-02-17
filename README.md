# secret_santa

A simple Single Page Application (SPA) built using MERN (MongoDB, Express, React, Node.js) with Nest.js as the backend framework. It allows users to randomly generate Secret Santa assignments for a large number of participants.

The core implementarion resolved to a bipartite graph problem, for which a Hopcroft-Karp algorithm was implemented to ensure efficient pairings while avoiding repeated matches from previous years.

## Description

Backend - Nest.js (Express)
Frontend - React (Vite + Tailwind)
Database - MongoDB

The project follows an MVC-inspired architecture, but it consists of two separate applications (React frontend and Nest.js backend) structured within a single repository. Uploaded files are stored locally within a dedicated file system.

## Project dependencies

Ensure you have the following installed:

Node.js v22.13.0
MongoDB v6.0.1
Yarn v1.22.19
npm v8.19.2

## Project setup

Run the following command to install all dependencies for both the frontend and backend:

```bash
$ yarn install:all
```

## Compile and run the project

Run the following command to start both the Nest.js backend and React frontend simultaneously using concurrently.

```bash
# development
$ yarn dev
```

## Run tests

To execute unit tests using Jest, run:

```bash
# unit tests
$ yarn run test
```

## Resources

Check out a few resources that were handy while working on this project:

- [NestJS Documentation](https://docs.nestjs.com) - Learn more about the backend framework.
- [React Documentation](https://react.dev/) - Explore best practices for building SPAs.
- [TailwindCSS Documentation](https://tailwindcss.com/) - Utility-first CSS framework used for styling.

## Developer

- Github - [AkshatJain-webdev](https://github.com/AkshatJain-webdev)
- Linked - [Akshat Jain](https://www.linkedin.com/in/akshat-jain-0312891a3/)
