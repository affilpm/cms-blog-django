export const endpoints = {
    register: '/api/users/register/',
    login: '/api/users/login/',
    logout: '/api/users/logout/',
    //User-Management
    admin_user_list: '/api/users/admin-user-management/',
    admin_user_create: '/api/users/admin-user-management/',
    admin_user_detail: (id) => `/api/users/admin-user-management/${id}/`, 
    admin_user_edit: (id) => `/api/users/admin-user-management/${id}/`,
    admin_user_delete: (id) => `/api/users/admin-user-management/${id}/`,
    admin_user_toggle: (id) => `/api/users/admin-user-management/${id}/toggle-status/`,
    //Post-Management  
    category_list: '/api/posts/category/',
    create_draft: '/api/posts/post/',
    create_post: '/api/posts/post/',
    list_post: '/api/posts/post/',
    edit_post: (id) => `/api/posts/post/${id}/`,
    delete_post: (id) => `/api/posts/post/${id}/`,
    toggle_status: (id) => `/api/posts/post/${id}/toggle-status/`,
    //post-detail
    fetch_like_status: (id) => `/api/posts/${id}/like/`,
    toggle_like: (id) => `/api/posts/${id}/like/`,
    fetch_comments: (id) => `/api/posts/comments/?post=${id}`,
    view_counter: (id) => `/api/posts/${id}/view/`,
    //comment-handler
    toggle_comment: (id) => `/api/posts/${id}/toggle-comment/`,
    approve_all_comments: '/api/posts/approve-comments/',






};