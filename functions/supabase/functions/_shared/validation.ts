/**
 * Validation utilities
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isValidPhone(phone: string): boolean {
  // Basic phone validation - can be enhanced based on requirements
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function isValidLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

export function isValidLongitude(long: number): boolean {
  return long >= -180 && long <= 180;
}

export function validatePagination(page?: string, limit?: string) {
  const pageNum = page ? parseInt(page) : 1;
  const limitNum = limit ? parseInt(limit) : 10;

  if (isNaN(pageNum) || pageNum < 1) {
    return { valid: false, error: 'Invalid page number' };
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return { valid: false, error: 'Invalid limit (must be between 1 and 100)' };
  }

  return {
    valid: true,
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
  };
}
