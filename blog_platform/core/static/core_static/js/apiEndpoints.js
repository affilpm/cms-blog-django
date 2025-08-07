export const endpoints = {
    register: '/api/users/register/',
    login: '/api/users/login/',
    logout: '/api/users/logout/',
    admin_user_list: '/api/users/admin-user-management/',
    admin_user_create: '/api/users/admin-user-management/',
    admin_user_detail: (id) => `/api/users/admin-user-management/${id}/`, 
    admin_user_edit: (id) => `/api/users/admin-user-management/${id}/`,
    admin_user_delete: (id) => `/api/users/admin-user-management/${id}/`,
    admin_user_toggle: (id) => `/api/users/admin-user-management/${id}/toggle-status/`,
};