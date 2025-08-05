from django.shortcuts import redirect
from core.utils.jwt_helper import JWTHelper

class JWTLoginRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        access_token = request.COOKIES.get('access_token')
        if access_token and JWTHelper.is_token_valid(access_token):
            if not hasattr(request, 'user') or not request.user.is_authenticated:
                request.user = JWTHelper.get_user_from_token(access_token)
            if request.user:
                return super().dispatch(request, *args, **kwargs)
        return redirect('login')
    
class SuperUserRequiredMixin(JWTLoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)    
        if not request.user or not request.user.is_superuser:
            return redirect('login')
        return response
        
class NormalUserOnlyMixin(JWTLoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)        
        if not request.user or request.user.is_superuser or request.user.is_staff:
            return redirect('login')
        return response
        
class RedirectAuthenticatedUserMixin:
    def dispatch(self, request, *args, **kwargs):
        access_token = request.COOKIES.get('access_token')
        if access_token and JWTHelper.is_token_valid(access_token):
            user = JWTHelper.get_user_from_token(access_token)
            
            if user:
                if user.is_superuser or user.is_staff:
                    return redirect('/')
                else:
                    return redirect('home')
        return super().dispatch(request, *args, **kwargs)
    
            