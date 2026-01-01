/**
 * Admin Configuration System
 * 
 * Centralized management of admin permissions and roles.
 * Supports both environment-based super admins and database-managed admins.
 */

interface AdminConfig {
  superAdmins: string[]
  defaultAdminPermissions: string[]
  requireInvitation: boolean
  developmentMode: boolean
  bypassServerAuth: boolean
}

interface AdminPermissions {
  canManageUsers: boolean
  canManageContent: boolean
  canManageProjects: boolean
  canManageOrganizations: boolean
  canViewAnalytics: boolean
  canModifyRoles: boolean
  canAccessSuperAdmin: boolean
}

export class AdminConfigManager {
  private static instance: AdminConfigManager
  private config: AdminConfig

  private constructor() {
    this.config = {
      superAdmins: this.getSuperAdminEmails(),
      defaultAdminPermissions: [
        'manage_users',
        'manage_content',
        'manage_projects',
        'view_analytics',
        'modify_roles'
      ],
      requireInvitation: true,
      developmentMode: process.env.NODE_ENV === 'development',
      bypassServerAuth: process.env.NODE_ENV === 'development' || process.env.BYPASS_SERVER_AUTH === 'true'
    }
  }

  static getInstance(): AdminConfigManager {
    if (!AdminConfigManager.instance) {
      AdminConfigManager.instance = new AdminConfigManager()
    }
    return AdminConfigManager.instance
  }

  /**
   * Get super admin emails from environment and fallback
   */
  private getSuperAdminEmails(): string[] {
    const envAdmins = process.env.SUPER_ADMIN_EMAILS?.split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0) || []

    // Fallback super admins (can be removed in production)
    const fallbackAdmins = [
      'benjamin@act.place',
      'knighttss@gmail.com',
    ]

    return [...envAdmins, ...fallbackAdmins]
  }

  /**
   * Check if email is a super admin
   */
  isSuperAdmin(email: string | null): boolean {
    if (!email) return false
    return this.config.superAdmins.includes(email.toLowerCase())
  }

  /**
   * Get default admin permissions
   */
  getDefaultAdminPermissions(): AdminPermissions {
    return {
      canManageUsers: true,
      canManageContent: true,
      canManageProjects: true,
      canManageOrganizations: false, // Only super admins
      canViewAnalytics: true,
      canModifyRoles: true,
      canAccessSuperAdmin: false // Only super admins
    }
  }

  /**
   * Get super admin permissions
   */
  getSuperAdminPermissions(): AdminPermissions {
    return {
      canManageUsers: true,
      canManageContent: true,
      canManageProjects: true,
      canManageOrganizations: true,
      canViewAnalytics: true,
      canModifyRoles: true,
      canAccessSuperAdmin: true
    }
  }

  /**
   * Get permissions for a user based on their status
   */
  getUserPermissions(email: string | null, isOrgAdmin: boolean = false): AdminPermissions {
    if (this.isSuperAdmin(email)) {
      return this.getSuperAdminPermissions()
    }

    if (isOrgAdmin) {
      return this.getDefaultAdminPermissions()
    }

    // Regular user - no admin permissions
    return {
      canManageUsers: false,
      canManageContent: false,
      canManageProjects: false,
      canManageOrganizations: false,
      canViewAnalytics: false,
      canModifyRoles: false,
      canAccessSuperAdmin: false
    }
  }

  /**
   * Check if admin invitations are required
   */
  requiresInvitation(): boolean {
    return this.config.requireInvitation
  }

  /**
   * Add a super admin email (for dynamic configuration)
   */
  addSuperAdmin(email: string): void {
    const normalizedEmail = email.toLowerCase().trim()
    if (!this.config.superAdmins.includes(normalizedEmail)) {
      this.config.superAdmins.push(normalizedEmail)
    }
  }

  /**
   * Remove a super admin email
   */
  removeSuperAdmin(email: string): void {
    const normalizedEmail = email.toLowerCase().trim()
    this.config.superAdmins = this.config.superAdmins.filter(
      admin => admin !== normalizedEmail
    )
  }

  /**
   * Get all super admin emails (for debugging)
   */
  getSuperAdmins(): string[] {
    return [...this.config.superAdmins]
  }

  /**
   * Check if we're in development mode
   */
  isDevelopmentMode(): boolean {
    return this.config.developmentMode
  }

  /**
   * Check if server auth should be bypassed
   */
  shouldBypassServerAuth(): boolean {
    return this.config.bypassServerAuth
  }

  /**
   * Check if user should be granted super admin in development
   */
  isDevelopmentSuperAdmin(): boolean {
    return this.config.developmentMode && this.config.bypassServerAuth
  }
}

// Export singleton instance
export const adminConfig = AdminConfigManager.getInstance()

/**
 * Cultural-specific admin roles for indigenous communities
 */
export interface CulturalAdminRoles {
  elder: boolean
  culturalKeeper: boolean
  knowledgeHolder: boolean
  culturalLiaison: boolean
}

export class CulturalAdminManager {
  /**
   * Get cultural permissions based on traditional roles
   */
  static getCulturalPermissions(roles: CulturalAdminRoles): Partial<AdminPermissions> {
    return {
      canManageContent: roles.elder || roles.culturalKeeper || roles.knowledgeHolder,
      canViewAnalytics: roles.elder || roles.culturalKeeper,
      canModifyRoles: roles.elder,
      // Cultural protocols override standard admin rules
      canManageUsers: roles.elder,
      canManageProjects: roles.elder || roles.culturalKeeper
    }
  }

  /**
   * Check if user has cultural authority for specific actions
   */
  static hasCulturalAuthority(
    action: string, 
    roles: CulturalAdminRoles,
    contentType?: string
  ): boolean {
    switch (action) {
      case 'access_sacred_content':
        return roles.elder || roles.culturalKeeper
      case 'modify_traditional_knowledge':
        return roles.elder || roles.knowledgeHolder
      case 'approve_story_publication':
        return roles.elder || roles.culturalKeeper
      case 'assign_cultural_roles':
        return roles.elder
      default:
        return false
    }
  }
}