import DOMPurify from 'dompurify';

/**
 * XSS Protection Utilities
 * 
 * Provides comprehensive protection against Cross-Site Scripting (XSS) attacks
 * using DOMPurify for HTML sanitization and custom validators for input validation.
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * @param dirty - Untrusted HTML string
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string safe for rendering
 * 
 * @example
 * ```tsx
 * const userInput = "<script>alert('xss')</script>Hello";
 * const safe = sanitizeHtml(userInput);
 * // Result: "Hello"
 * ```
 */
export function sanitizeHtml(
  dirty: string,
  options?: DOMPurify.Config
): string {
  const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };
  
  const config = { ...defaultConfig, ...options };
  return String(DOMPurify.sanitize(dirty, config as any));
}

/**
 * Sanitize plain text (removes all HTML tags)
 * 
 * @param dirty - Untrusted text string
 * @returns Plain text with all HTML removed
 * 
 * @example
 * ```tsx
 * const userInput = "<script>alert('xss')</script>Hello";
 * const safe = sanitizeText(userInput);
 * // Result: "Hello"
 * ```
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize URL to prevent javascript: and data: URI attacks
 * 
 * @param url - Untrusted URL string
 * @returns Sanitized URL or empty string if invalid
 * 
 * @example
 * ```tsx
 * const userUrl = "javascript:alert('xss')";
 * const safe = sanitizeUrl(userUrl);
 * // Result: ""
 * 
 * const validUrl = "https://example.com";
 * const safe2 = sanitizeUrl(validUrl);
 * // Result: "https://example.com"
 * ```
 */
export function sanitizeUrl(url: string): string {
  const sanitized = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = sanitized.toLowerCase().trim();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      console.warn('[XSS] Blocked dangerous URL protocol:', protocol);
      return '';
    }
  }
  
  return sanitized;
}

/**
 * Escape HTML special characters
 * 
 * @param text - Text to escape
 * @returns Escaped text safe for HTML insertion
 * 
 * @example
 * ```tsx
 * const userInput = "<script>alert('xss')</script>";
 * const escaped = escapeHtml(userInput);
 * // Result: "&lt;script&gt;alert('xss')&lt;/script&gt;"
 * ```
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validate and sanitize user input
 * 
 * @param input - User input string
 * @param options - Validation options
 * @returns Sanitized input or null if invalid
 * 
 * @example
 * ```tsx
 * const userInput = "John<script>alert('xss')</script>Doe";
 * const safe = validateInput(userInput, { maxLength: 100 });
 * // Result: "JohnDoe"
 * ```
 */
export function validateInput(
  input: string,
  options: {
    maxLength?: number;
    minLength?: number;
    allowHtml?: boolean;
    pattern?: RegExp;
  } = {}
): string | null {
  const {
    maxLength = 1000,
    minLength = 0,
    allowHtml = false,
    pattern,
  } = options;
  
  // Sanitize first
  const sanitized = allowHtml ? sanitizeHtml(input) : sanitizeText(input);
  
  // Check length
  if (sanitized.length < minLength || sanitized.length > maxLength) {
    console.warn('[XSS] Input length validation failed');
    return null;
  }
  
  // Check pattern
  if (pattern && !pattern.test(sanitized)) {
    console.warn('[XSS] Input pattern validation failed');
    return null;
  }
  
  return sanitized;
}

/**
 * Sanitize object properties recursively
 * 
 * @param obj - Object with potentially unsafe values
 * @param allowHtml - Whether to allow HTML in string values
 * @returns Object with sanitized values
 * 
 * @example
 * ```tsx
 * const userObj = {
 *   name: "John<script>alert('xss')</script>",
 *   bio: "<p>Hello</p><script>alert('xss')</script>",
 * };
 * const safe = sanitizeObject(userObj);
 * // Result: { name: "John", bio: "<p>Hello</p>" }
 * ```
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  allowHtml = false
): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = allowHtml ? sanitizeHtml(value) : sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string'
          ? allowHtml ? sanitizeHtml(item) : sanitizeText(item)
          : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, allowHtml);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Check if string contains potential XSS patterns
 * 
 * @param input - String to check
 * @returns True if suspicious patterns detected
 * 
 * @example
 * ```tsx
 * const userInput = "<script>alert('xss')</script>";
 * const isSuspicious = containsXssPatterns(userInput);
 * // Result: true
 * ```
 */
export function containsXssPatterns(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /eval\(/gi,
    /expression\(/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Safe JSON parse with XSS protection
 * 
 * @param json - JSON string to parse
 * @returns Parsed object with sanitized strings
 * 
 * @example
 * ```tsx
 * const json = '{"name":"John<script>alert(1)</script>"}';
 * const safe = safeJsonParse(json);
 * // Result: { name: "John" }
 * ```
 */
export function safeJsonParse<T = any>(json: string): T | null {
  try {
    const parsed = JSON.parse(json);
    
    if (typeof parsed === 'object' && parsed !== null) {
      return sanitizeObject(parsed);
    }
    
    if (typeof parsed === 'string') {
      return sanitizeText(parsed) as any;
    }
    
    return parsed;
  } catch (error) {
    console.error('[XSS] JSON parse failed:', error);
    return null;
  }
}

/**
 * Create a safe HTML string for React dangerouslySetInnerHTML
 * 
 * @param html - HTML string to sanitize
 * @returns Object with __html property for React
 * 
 * @example
 * ```tsx
 * const userHtml = "<p>Hello</p><script>alert('xss')</script>";
 * <div dangerouslySetInnerHTML={createSafeHtml(userHtml)} />
 * // Renders: <div><p>Hello</p></div>
 * ```
 */
export function createSafeHtml(html: string): { __html: string } {
  return {
    __html: sanitizeHtml(html),
  };
}

/**
 * Validate email address and sanitize
 * 
 * @param email - Email address to validate
 * @returns Sanitized email or null if invalid
 */
export function validateEmail(email: string): string | null {
  const sanitized = sanitizeText(email).trim().toLowerCase();
  
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
}

/**
 * Validate phone number and sanitize
 * 
 * @param phone - Phone number to validate
 * @returns Sanitized phone or null if invalid
 */
export function validatePhone(phone: string): string | null {
  const sanitized = sanitizeText(phone).trim();
  
  // Allow only digits, spaces, +, -, (, )
  const phoneRegex = /^[\d\s+\-()]+$/;
  
  if (!phoneRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
}
