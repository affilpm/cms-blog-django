// Generic function for JSON requests (GET, POST, PUT, PATCH, DELETE)
async function apiRequest(method, url, data = null, withCredentials = false) {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
    };

    if (withCredentials) {
        options.credentials = 'include';
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    if (response.status === 401) {
        alert('Session expired. Please log in again.');
        window.location.href = 'users/login/'; 
        return { response, data: null };
    }

    return { response, data: responseData };
}

// Specific helpers
export function get(url, withCredentials = false) {
    return apiRequest('GET', url, null, withCredentials);
}

export function post(url, data = null, withCredentials = false) {
    return apiRequest('POST', url, data, withCredentials);
}

export function put(url, data, withCredentials = false) {
    return apiRequest('PUT', url, data, withCredentials);
}

export function patch(url, data, withCredentials = false) {
    return apiRequest('PATCH', url, data, withCredentials);
}

export function del(url, withCredentials = false) {
    return apiRequest('DELETE', url, null, withCredentials);
}

// For forms specifically
export async function postFormData(url, formData, withCredentials = false) {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    const options = {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
        },
        body: formData,
    };

    if (withCredentials) {
        options.credentials = 'include';
    }

    const response = await fetch(url, options);
    const data = await response.json();
    return { response, data };
}

export async function patchFormData(url, formData, withCredentials = false) {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    const options = {
        method: 'PATCH',
        headers: {
            'X-CSRFToken': csrfToken,
        },
        body: formData,
    };

    if (withCredentials) {
        options.credentials = 'include';
    }

    const response = await fetch(url, options);
    const data = await response.json();
    return { response, data };
}