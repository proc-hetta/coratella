import { defineParams } from '@sveltejs/kit/params';

function matchNumber(value: string) {
  return /^\d+$/.test(value);
}

function matchNumberOrNew(value: string) {
  return /^(\d+|new)$/.test(value);
}

export const params = defineParams({
  number: (param) => (matchNumber(param) ? param : undefined),
  numberOrNew: (param) => (matchNumberOrNew(param) ? param : undefined),
});
