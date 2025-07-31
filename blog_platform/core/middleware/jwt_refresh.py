from django.utils.deprecation import MiddlewareMixin
from django.shortcuts import redirect
from django.contrib import messages
from django.contrib.auth import get_user_model
from ..utils.jwt_helper import JWTHelper

User = get_user_model()

class JWTRefreshMiddleware(MiddlewareMixin):
    EXEMPT_PATHS = ['/api/users/login', '/api/users/register', '/login/', '/register/']
    
    def process_request(self, request):
        if any(request.path.startswith(path) for path in self.EXEMPT_PATHS):
            return None
        
        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not access_token and not refresh_token:
            return None
        
        if access_token and JWTHelper.is_token_valid(access_token):
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
            user = JWTHelper.get_user_from_token(access_token)
            if user:
                request.user = user
            return None
            
        if refresh_token:
            new_tokens = JWTHelper.refresh_tokens(refresh_token)
            if new_tokens:
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {new_tokens["access"]}'
                user = JWTHelper.get_user_from_token(new_tokens['access'])
                if user:
                    request.user = user

                request._new_access_token = new_tokens['access']
                request._new_refresh_token = new_tokens['refresh']
                return None
            
        if not request.path.startswith('/api/'):
            return self._force_logout_redirect(request)
        
        return None
    
    def process_response(self, request, response):
        if hasattr(request, '_new_access_token') and hasattr(request, '_new_refresh_token'):
            JWTHelper.set_auth_cookies(
                response,
                request._new_access_token,
                request._new_refresh_token
            )
            
        return response
        
    def _force_logout_redirect(self, request):
        response = redirect('login')  
        JWTHelper.clear_auth_cookies(response)
        messages.error(request, 'Your session has expired. Please login again.')
        return response
