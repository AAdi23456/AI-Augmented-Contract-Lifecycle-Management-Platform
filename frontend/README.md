# AI-CLM Platform Frontend

This is the frontend for the AI-Augmented Contract Lifecycle Management Platform, built with Next.js, TailwindCSS, and shadcn/ui.

## Features

- Modern UI with shadcn/ui components
- Contract management dashboard
- File upload interface
- Contract viewing and analysis
- User authentication with Firebase
- Role-based access control

## Folder Structure

```
frontend/
├── app/                 # Next.js App Router structure
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── contracts/       # Contract management pages
│   ├── dashboard/       # Dashboard pages
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Homepage
├── components/          # React components
│   ├── contracts/       # Contract-related components
│   ├── dashboard/       # Dashboard components
│   ├── layout/          # Layout components
│   ├── ui/              # shadcn/ui components
│   └── users/           # User-related components
├── lib/                 # Utility functions
│   ├── firebase.ts      # Firebase configuration
│   └── utils.ts         # Helper functions
├── public/              # Static assets
└── styles/              # Global styles
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables by creating a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   
   # Firebase config
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint

## shadcn/ui Components

This project uses the following shadcn/ui components:

- Button
- Card
- Dialog
- Table
- Sheet
- Tooltip
- Accordion

Additional components can be added as needed using:
```
npx shadcn add <component-name>
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
