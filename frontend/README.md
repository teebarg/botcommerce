<h1 align="center">
  A Robust E-Commerce Storefront
</h1>

<p align="center">
  A robust e-commerce storefront built with Next.js 14 and FastAPI.
</p>

<p align="center">
  <a href="https://github.com/teebarg/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
</p>

# Overview

This is a custom e-commerce storefront built with:

-   [Next.js](https://nextjs.org/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Typescript](https://www.typescriptlang.org/)

Features include:

-   Full ecommerce support:
    -   Product Detail Page
    -   Product Overview Page
    -   Search with MeiliSearch
    -   Product Collections
    -   Cart
    -   Checkout
    -   User Accounts
    -   Order Details
-   Full Next.js 14 support:
    -   App Router
    -   Next fetching/caching
    -   Server Components
    -   Server Actions
    -   Streaming
    -   Static Pre-Rendering

# Quickstart

### Setting up the environment variables

Navigate into your projects directory and get your environment variables ready:

```shell
cd /path/to/your/project
mv .env.template .env.local
```

### Install dependencies

Use Yarn to install all dependencies.

```shell
yarn
```

### Start developing

You are now ready to start up your project.

```shell
yarn dev
```

### Open the code and start customizing

Your site is now running at http://localhost:8000!

# Search integration

This is configured to support using the `meilisearch` plugin out of the box. To enable search you will need to enable the feature flag in `./store.config.json`, which you do by changing the config to this:

```javascript
{
  "features": {
    // other features...
    "search": true
  }
}
```

## App structure

```
.
└── src
    ├── app
    ├── lib
    ├── modules
    ├── styles
    ├── types
    └── middleware.ts

```

### `/app` directory

The app folder contains all Next.js App Router pages and layouts, and takes care of the routing.

```
.
|____
    ├── (checkout)
        └── checkout
    └── (main)
        ├── account
        │   ├── addresses
        │   └── orders
        │       └── details
        │           └── [id]
        ├── cart
        ├── collections
        │   └── [slug]
        ├── order
        │   └── confirmed
        │       └── [id]
        ├── products
        │   └── [slug]
        ├── search
            └── [query]
```

This structure enables efficient routing and organization of different parts of the Starter.

### `/lib` **directory**

The lib directory contains all utilities like the client functions, util functions, config and constants.

The most important file here is `/lib/data/index.ts`. This file defines various functions for interacting with the API, using the JS client. The functions cover a range of actions related to shopping carts, orders, shipping, authentication, customer management, products, collections, and categories. It also includes utility functions for handling headers and errors, as well as some functions for sorting and transforming product data.

These functions are used in different Server Actions.

### `/modules` directory

This is where all the components, templates and Server Actions are, grouped by section. Some subdirectories have an `actions.ts` file. These files contain all Server Actions relevant to that section of the app.

### `/styles` directory

`global.css` imports Tailwind classes and defines a couple of global CSS classes. Tailwind classes are used for styling throughout the app.

### `/types` directory

Contains global TypeScript type defintions.

### `middleware.ts`

Next.js Middleware, which is basically an Edge function that runs before (almost) every request.

# Resources

## Learn more about Next.js

-   [Website](https://nextjs.org/)
-   [GitHub](https://github.com/vercel/next.js)
-   [Documentation](https://nextjs.org/docs)
