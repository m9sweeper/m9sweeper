export interface IHelmInputRegistry {
    registries: IcliRegistry[];
}

export interface IcliRegistry {
    name: string;
    hostname: string;
    aliases?: string[];
    login_required?: boolean;
    username?: string;
    password?: string;
}