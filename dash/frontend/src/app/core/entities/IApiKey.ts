export interface IApiKey {
    id?: number;
    userId?: string;
    name: string;
    api?: string;
    isActive: boolean;
    firstName?: string;
    lastName?: string;
}


export interface IApiKeyList {
    count: number;
    list: Array<IApiKey>;
}
