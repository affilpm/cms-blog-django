import jwt 
import datetime
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.state import token_backend

User = get_user_model()

class JWTHelper:
    """
    Utility class for JWT token operations. 
    Handles token validation, refresh, and cookie management.
    """
    
    @staticmethod
    def _decode_token(token):
        try:
            return token_backend.decode(token, verify=True)
        except Exception:
            return None
        
    @staticmethod
    def _is_token_expired(payload):
        if not payload or 'exp' not in payload:
            return True
        
        exp = datetime.datetime.fromtimestamp(payload['exp'], tz=datetime.timezone.utc)
        return datetime.datetime.now(datetime.timezone.utc) > exp 
    
    @staticmethod
    def is_token_valid(token):
        try:
            UntypedToken(token)
            return True
        except (TokenError, InvalidToken):
            return False
    
    @staticmethod
    def get_user_from_token(token):
        """Extract user from access token"""
        try:
            payload = JWTHelper._decode_token(token)
            if payload and 'user_id' in payload:
                return User.objects.get(id=payload['user_id'])
        except (User.DoesNotExist, Exception):
            pass
        return None
    
    @staticmethod
    def refresh_tokens(refresh_token):
        try:
            refresh = RefreshToken(refresh_token)
            new_refresh = str(refresh) if settings.SIMPLE_JWT.get('ROTATE_REFRESH_TOKENS', False) else refresh_token
            return {
                'access': str(refresh.access_token),
                'refresh': new_refresh
            } 
        except (TokenError, InvalidToken):
            return None          
        
    @staticmethod
    def set_auth_cookies(response, access_token, refresh_token):
        response.set_cookie(
            key='access_token',
            value=access_token,
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            httponly=True,
            secure=settings.SIMPLE_JWT.get('AUTH_COOKIE_SECURE', False),
            samesite=settings.SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax'),
        )        
        
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
            httponly=True,
            secure=settings.SIMPLE_JWT.get('AUTH_COOKIE_SECURE', False),
            samesite=settings.SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax'),
        )         
        
    @staticmethod
    def clear_auth_cookies(response):
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        
    @staticmethod
    def get_tokens_for_user(user):
        return RefreshToken.for_user(user)