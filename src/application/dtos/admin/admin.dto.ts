import { UserResponseDto } from "../auth/auth.dto";

export interface UserListResponseDto {
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminUserDetailDto {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address: string;
    avatar_url?: string;
    roles: string[];
    is_active: boolean;
    is_blocked: boolean;
    is_verified: boolean;
    joined_at: Date;
}

export interface AdminStatsDto {
    totalUsers: number;
    pendingKyc: number;
    activeSellers: number;
    suspendedUsers: number;
}

export interface AdminAuctionListResponseDto {
    auctions: any[]; // Using any[] for now as Auction entity is complex to import here without circular deps or just import it
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
