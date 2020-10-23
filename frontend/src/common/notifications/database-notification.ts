export interface DatabaseNotification {
    id: string;
    read_at: string;
    relative_created_at: string;
    time_period: string;
    data: DatabaseNotificationData;
}

export interface DatabaseNotificationAction {
    label: string;
    action: string;
}

export interface DatabaseNotificationData {
    image: string;
    warning?: boolean;
    mainAction?: DatabaseNotificationAction;
    lines: {
        content: string;
        icon?: string;
        type?: 'secondary'|'primary';
        action?: DatabaseNotificationAction;
    }[];
}

export interface BroadcastNotification extends DatabaseNotificationData {
    id: string;
    type: string;
}
