// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      user: import('$lib/server/auth').SessionValidationResult['user'];
    }
  }
}

export {};
