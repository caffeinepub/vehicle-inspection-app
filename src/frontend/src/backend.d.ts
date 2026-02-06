import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ApprovalComment {
    status: ReportStatus;
    officerName: string;
    officerPrincipal: Principal;
    comment: string;
    timestamp: Time;
}
export type Time = bigint;
export interface LetterheadInfo {
    contactInfo: string;
    address: string;
    companyName: string;
}
export interface VehicleInspectionInput {
    id: string;
    vin: string;
    damages: string;
    model: string;
    mileage: bigint;
    licensePlate: string;
    make: string;
    year: number;
    notes: string;
    photos: Array<ExternalBlob>;
    condition: string;
}
export interface UserProfilePublic {
    name: string;
    role: Role;
}
export interface ReviewResult {
    status: ReportStatus;
    approvalHistory: Array<ApprovalComment>;
}
export interface VehicleInspectionPublic {
    id: string;
    vin: string;
    damages: string;
    model: string;
    mileage: bigint;
    licensePlate: string;
    approvalComments: Array<ApprovalComment>;
    inspectorPrincipal: Principal;
    reportStatus: ReportStatus;
    make: string;
    inspectorName: string;
    year: number;
    notes: string;
    timestamp: Time;
    photos: Array<ExternalBlob>;
    condition: string;
}
export interface LetterheadInfoPublic {
    contactInfo: string;
    address: string;
    companyName: string;
}
export interface UserProfile {
    name: string;
    role: Role;
}
export enum ReportStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum Role {
    insuranceOfficer = "insuranceOfficer",
    inspector = "inspector"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllInspections(): Promise<Array<VehicleInspectionPublic>>;
    getCallerUserProfile(): Promise<UserProfilePublic>;
    getCallerUserRole(): Promise<UserRole>;
    getInspection(reportId: string): Promise<VehicleInspectionPublic>;
    getInspectionsByInspector(inspectorPrincipal: Principal): Promise<Array<VehicleInspectionPublic>>;
    getInspectionsByStatus(status: ReportStatus): Promise<Array<VehicleInspectionPublic>>;
    getLetterheadInfo(): Promise<LetterheadInfoPublic>;
    getUserProfile(user: Principal): Promise<UserProfilePublic>;
    isCallerAdmin(): Promise<boolean>;
    reviewInspection(reportId: string, status: ReportStatus, comment: string): Promise<ReviewResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitInspection(input: VehicleInspectionInput): Promise<void>;
    updateLetterheadInfo(newInfo: LetterheadInfo): Promise<void>;
}
