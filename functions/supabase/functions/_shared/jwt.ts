/**
 * JWT utilities for manual token validation
 */

export function decodeJWT(token: string): any {
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '').trim();
    
    // JWT has 3 parts: header.payload.signature
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

export function isJWTExpired(payload: any): boolean {
  if (!payload || !payload.exp) {
    return true;
  }
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}
