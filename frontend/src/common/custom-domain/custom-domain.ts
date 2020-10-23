export interface CustomDomain {
    id: number;
    host: string;
    user_id: number;
    global: boolean;
    created_at: string;
    updated_at: string;
    resource?: {[key: string]: any};
}
