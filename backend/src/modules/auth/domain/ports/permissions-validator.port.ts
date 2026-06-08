export interface IPermissionsValidator {
  validateUserPermissions(userId: number, requiredPermissions: string[]): Promise<boolean>;
}

export const PERMISSIONS_VALIDATOR = 'PERMISSIONS_VALIDATOR';
