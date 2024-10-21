# SoloServer и Multi-Worker Server
This project is a Node.js application that runs a server in both single-threaded and multi-threaded (clustered) modes, utilizing worker processes and a load balancer. It supports both development and production environments.

## Features
- Single server mode: Run the server on a single thread.
- Multi-server mode: Use Node.js clustering to distribute the load across multiple CPU cores.
- Load Balancer: A simple round-robin load balancer distributes requests to multiple worker servers.
- Automatic worker restart: If a worker crashes, a new one is spawned automatically.
- TypeScript support: The project is built using TypeScript, ensuring type safety and better development experience.
- ESLint and Prettier integration: Code is linted and formatted according to established standards.

## Prerequisites
- Node.js (v22.x or higher)
- TypeScript (v5.x or higher)

## Getting Started

### Installation
1. Clone the repository:

```bash
git clone https://github.com/your-repo/project-name.git
cd project-name
```
2. Install the dependencies:
```bash
npm install
```

### Available Scripts
In the package.json file, there are several scripts that can be used to run the application in different modes:

- Development Single-Threaded Mode:

This runs the server in a single-threaded mode using nodemon for automatic restarts during development.

```bash
npm run dev:single
```

This starts the server in single-threaded mode without automatic restarts.
```bash
npm run start:dev
```

- Development Multi-Threaded Mode (Cluster):
  
This starts the server in multi-threaded mode with a load balancer distributing requests to the worker processes.

```bash
npm run dev:multi
```

This starts the multi-threaded server without automatic restarts. 

```bash
npm run start:dev:multi
```

- Production Single-Threaded Mode:
This command compiles the TypeScript code into JavaScript and runs the single-threaded server.

```bash
npm run start:prod
```

- Production Multi-Threaded Mode (Cluster):
This command compiles the TypeScript code into JavaScript and runs the multi-threaded server with a load balancer.

```bash
npm run start:prod:multi
```

- Code Formatting and Linting:

To check code formatting:
```bash
npm run format
```

To automatically fix formatting issues:
```bash
npm run format:fix
```

To lint the code:
```bash
npm run lint
```

To automatically fix linting issues:
```bash
npm run lint:fix
```

TypeScript Type Check:
```bash
npm run ts
```
This will run TypeScript's type-checker without emitting any compiled files.

## Project Structure
- src/: Contains the source code for the application.
    - singleServer.ts: The entry point for running the application in single-threaded mode.
    - multiServer.ts: The entry point for running the application in multi-threaded (clustered) mode.
- dist/: This folder will contain the compiled JavaScript files after running npm run start:prod or npm run start:prod:multi.

## Multi-Worker Server Management
In multi-threaded mode, the application starts a load balancer that listens on a specified port and proxies incoming requests to worker processes. Each worker runs on a separate port, and requests are distributed using the round-robin method.

If a worker process crashes, the system automatically spawns a new worker to maintain availability.

### Key Points:
- The load balancer listens on port 4000 by default.
- Each worker runs on a unique port, starting from 4001 and incrementing by one for each additional worker.
- Workers are managed using Node.js's cluster module. 
