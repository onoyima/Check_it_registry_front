// User display name helpers for frontend
// Supports both new split name fields and legacy 'name' field

interface UserName {
  name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
}

/**
 * Get the full display name from a user object.
 * Prefers first_name/middle_name/last_name if available,
 * falls back to legacy 'name' field.
 */
export function getDisplayName(user: UserName | null | undefined): string {
  if (!user) return '';

  const firstName = (user.first_name || '').trim();
  const middleName = (user.middle_name || '').trim();
  const lastName = (user.last_name || '').trim();

  if (firstName) {
    const parts = [firstName];
    if (middleName) parts.push(middleName);
    if (lastName) parts.push(lastName);
    return parts.join(' ');
  }

  return (user.name || '').trim();
}

/**
 * Get the first name only.
 */
export function getFirstName(user: UserName | null | undefined): string {
  if (!user) return '';
  if (user.first_name) return user.first_name.trim();
  const name = (user.name || '').trim();
  return name.split(' ')[0] || '';
}

/**
 * Get user initials for avatar display.
 */
export function getUserInitials(user: UserName | null | undefined): string {
  const name = getDisplayName(user);
  if (!name) return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || '?';
}
