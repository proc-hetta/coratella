import type { User } from '$lib/server/db/schema';
import type { PageServerLoad } from '../login/$types';

export const load: PageServerLoad = async ({ locals }) => {
  const user: User = locals.user;
  const reducedUser: {
    id: string;
    username: string;
  } = {
    id: user.id,
    username: user.username,
  };

  return {
    user: reducedUser,
  };
};
