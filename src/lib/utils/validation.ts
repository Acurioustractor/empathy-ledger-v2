import { NextResponse } from 'next/server'
import { ApiErrors } from './api-responses'

export interface ValidationRule {
  field: string
  type?: 'string' | 'number' | 'email' | 'uuid' | 'array' | 'object' | 'boolean'
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  allowedValues?: (string | number)[]
  custom?: (value: any) => boolean | string
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export class RequestValidator {
  private rules: ValidationRule[] = []

  constructor(rules: ValidationRule[]) {
    this.rules = rules
  }

  validate(data: any): ValidationError[] {
    const errors: ValidationError[] = []

    for (const rule of this.rules) {
      const value = data[rule.field]
      const fieldErrors = this.validateField(rule, value)
      errors.push(...fieldErrors)
    }

    return errors
  }

  validateAndRespond(data: any): NextResponse | null {
    const errors = this.validate(data)
    if (errors.length > 0) {
      return ApiErrors.ValidationError(
        `Validation failed for ${errors.length} field(s)`,
        { errors }
      )
    }
    return null
  }

  private validateField(rule: ValidationRule, value: any): ValidationError[] {
    const errors: ValidationError[] = []
    const { field, required = false } = rule

    // Check required
    if (required && (value === undefined || value === null || value === '')) {
      errors.push({ field, message: `${field} is required`, value })
      return errors
    }

    // Skip other validations if field is not required and empty
    if (!required && (value === undefined || value === null || value === '')) {
      return errors
    }

    // Type validation
    if (rule.type) {
      const typeError = this.validateType(rule, value)
      if (typeError) {
        errors.push(typeError)
        return errors // Don't continue if type is wrong
      }
    }

    // String-specific validations
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.minLength} characters`,
          value
        })
      }

      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push({
          field,
          message: `${field} must be at most ${rule.maxLength} characters`,
          value
        })
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({
          field,
          message: `${field} format is invalid`,
          value
        })
      }
    }

    // Number-specific validations
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.min}`,
          value
        })
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push({
          field,
          message: `${field} must be at most ${rule.max}`,
          value
        })
      }
    }

    // Array validations
    if (rule.type === 'array' && Array.isArray(value)) {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push({
          field,
          message: `${field} must have at least ${rule.minLength} items`,
          value
        })
      }

      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push({
          field,
          message: `${field} must have at most ${rule.maxLength} items`,
          value
        })
      }
    }

    // Allowed values validation
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push({
        field,
        message: `${field} must be one of: ${rule.allowedValues.join(', ')}`,
        value
      })
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value)
      if (customResult !== true) {
        errors.push({
          field,
          message: typeof customResult === 'string' ? customResult : `${field} is invalid`,
          value
        })
      }
    }

    return errors
  }

  private validateType(rule: ValidationRule, value: any): ValidationError | null {
    const { field, type } = rule

    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return { field, message: `${field} must be a string`, value }
        }
        break

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return { field, message: `${field} must be a number`, value }
        }
        break

      case 'email':
        if (typeof value !== 'string' || !this.isValidEmail(value)) {
          return { field, message: `${field} must be a valid email address`, value }
        }
        break

      case 'uuid':
        if (typeof value !== 'string' || !this.isValidUUID(value)) {
          return { field, message: `${field} must be a valid UUID`, value }
        }
        break

      case 'array':
        if (!Array.isArray(value)) {
          return { field, message: `${field} must be an array`, value }
        }
        break

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
          return { field, message: `${field} must be an object`, value }
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          return { field, message: `${field} must be a boolean`, value }
        }
        break
    }

    return null
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }
}

// Common validation patterns
export const ValidationPatterns = {
  // User/Profile validations
  email: { field: 'email', type: 'email' as const, required: true },
  displayName: {
    field: 'display_name',
    type: 'string' as const,
    required: true,
    minLength: 1,
    maxLength: 100
  },
  bio: {
    field: 'bio',
    type: 'string' as const,
    maxLength: 1000
  },

  // Story validations
  storyTitle: {
    field: 'title',
    type: 'string' as const,
    required: true,
    minLength: 1,
    maxLength: 200
  },
  storyContent: {
    field: 'content',
    type: 'string' as const,
    required: true,
    minLength: 10
  },
  authorId: { field: 'author_id', type: 'uuid' as const, required: true },

  // Media validations
  mediaId: { field: 'media_id', type: 'uuid' as const, required: true },
  galleryIds: {
    field: 'galleryIds',
    type: 'array' as const,
    required: true,
    minLength: 0
  },

  // Common validations
  id: { field: 'id', type: 'uuid' as const, required: true },
  status: {
    field: 'status',
    type: 'string' as const,
    allowedValues: ['active', 'inactive', 'pending', 'suspended', 'published', 'draft', 'review']
  },
  culturalSensitivity: {
    field: 'cultural_sensitivity_level',
    type: 'string' as const,
    allowedValues: ['low', 'medium', 'high', 'sacred']
  }
}

// Helper function for quick validation
export function validateRequest(data: any, rules: ValidationRule[]): NextResponse | null {
  const validator = new RequestValidator(rules)
  return validator.validateAndRespond(data)
}