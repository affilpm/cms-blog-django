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