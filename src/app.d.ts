// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      user: import('#lib/server/db/schema.ts').User | null;
    }
  }
}

export {};
