export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function randomCode(length = 6): string {
  const digits = '0123456789';
  let out = '';
  const bytes = require('crypto').randomBytes(length) as Buffer;
  for (let i = 0; i < length; i++) out += digits[bytes[i] % 10];
  return out;
}

export function memberCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = require('crypto').randomBytes(8) as Buffer;
  let out = 'GM-';
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}
