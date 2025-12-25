declare namespace NodeJS {
  interface ProcessEnv {
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
  }
}
