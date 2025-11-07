/************************************************************
 * Next.js configuration to expose required env vars to the
 * client bundle. This maps OPENAI_API_KEY from .env to a
 * public, build-time variable so the existing client-side
 * chat code can read it. Note: exposing secrets to the client
 * is generally insecure; for production, move OpenAI calls to
 * a server route. This change is minimal to get the chat working
 * as requested.
 ************************************************************/

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Make the key available at build time under a public-prefixed var
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  },
};

module.exports = nextConfig;
