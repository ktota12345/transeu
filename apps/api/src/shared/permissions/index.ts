
export const roles = [
    { id: 'ADMIN', name: 'Administrator' },
    { id: 'COMPANY_ADMIN', name: 'Administrator firmy' },
    { id: 'USER', name: 'Użytkownik' },
    { id: 'GUEST', name: 'Gość' },
];

export const privilegesOptions = {
    ADMIN_SECTION: 'Administrator section',
    MANAGE_USERS: 'Manage users',
    MANAGE_COMPANIES: 'Manage companies',
    GLOBAL_CONTEXT: 'Global Context',
}

const privileges:{
    [key: string]: string[];
} = {
    ADMIN: [
        privilegesOptions.ADMIN_SECTION,
        privilegesOptions.MANAGE_COMPANIES,
        privilegesOptions.MANAGE_USERS,
        privilegesOptions.GLOBAL_CONTEXT
    ],
    COMPANY_ADMIN: [
        privilegesOptions.ADMIN_SECTION,
        privilegesOptions.MANAGE_USERS
    ],
    USER: [],
    GUEST: [],
};

export const roleHasPrivilege = (role: string, privilege: string) => {
    if (!role || !privilege) return false;
    const userPrivileges = privileges[role] || [];
    return userPrivileges.includes(privilege);
}