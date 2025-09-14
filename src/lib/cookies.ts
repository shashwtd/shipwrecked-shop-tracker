'use client';

import Cookies from 'js-cookie';

export const USER_ID_COOKIE = 'shipwrecked-user-id';

export function getUserIdFromCookie(): string | undefined {
  return Cookies.get(USER_ID_COOKIE);
}

export function setUserIdCookie(userId: string) {
  Cookies.set(USER_ID_COOKIE, userId, {
    secure: true,
    sameSite: 'strict',
    expires: 365 // 1 year
  });
}
