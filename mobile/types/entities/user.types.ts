/**
 * User Entity Types
 */

export interface User {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    secondLastName?: string | null;
    username?: string | null;
    photoUrl?: string | null;
    createdAt: string;
    statusId: string;
    active: boolean;
}

/**
 * Public user profile (visible to other users)
 */
export interface UserPublic {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    username?: string | null;
    photoUrl?: string | null;
    createdAt: string;
}
