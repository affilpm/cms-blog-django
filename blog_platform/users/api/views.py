from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from .serializers import UserSerializer
from django.contrib.auth import authenticate
from core.utils.jwt_helper import JWTHelper
from rest_framework.permissions import IsAuthenticated
from core.utils.responses import success_response, error_response

class RegistrationAPIView(APIView):
    def post(self, request):
        serializer = UserSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return success_response(
                message='User registered succesfully.', 
                status_code=status.HTTP_201_CREATED
                )
        return error_response(
            message='Invalid form submission', 
            errors=serializer.errors, 
            status_code=status.HTTP_400_BAD_REQUEST
            )    
    
class LoginAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return error_response(
                message='Invalid form submission',
                errors='Email and password are required.',
                status_code=status.HTTP_400_BAD_REQUEST
            )
            
        user = authenticate(request, email=email, password=password)
        
        if user is not None:
            if not user.is_active:
                return error_response(
                    message='Restricted account',
                    errors='User account is deactivated.',
                    status_code=status.HTTP_403_FORBIDDEN
                )
                            
            refresh = JWTHelper.get_tokens_for_user(user)
            
            response = Response({
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username
                }
            })
            
            JWTHelper.set_auth_cookies(response, str(refresh.access_token), str(refresh))
            
            return success_response(
                data = {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username
                })
        
        return error_response(message='Invalid credentials', status_code=status.HTTP_401_UNAUTHORIZED)
    
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        response = Response({'success': True, 'details': 'Logged out successfully'})
        JWTHelper.clear_auth_cookies(response)
        return success_response(message='Logged out successfully')