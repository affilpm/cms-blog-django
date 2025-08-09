from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from .serializers import UserAuthSerializer, AdminUserCreateSerializer, AdminUserSerializer
from django.contrib.auth import authenticate
from core.utils.jwt_helper import JWTHelper
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from core.utils.responses import success_response, error_response
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from ..models import CustomUser

class RegistrationAPIView(APIView):
    def post(self, request):
        serializer = UserAuthSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return success_response(
                message='User registered succesfully.', 
                status_code=status.HTTP_201_CREATED
                )
        return error_response(
            message='Invalid form submission', 
            error=serializer.errors, 
            status_code=status.HTTP_400_BAD_REQUEST
            )    
    
class LoginAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return error_response(
                message='Invalid form submission',
                error='Email and password are required.',
                status_code=status.HTTP_400_BAD_REQUEST
            )
            
        user = authenticate(request, email=email, password=password)
        
        if user is not None:
            if not user.is_active:
                return error_response(
                    message='Restricted account',
                    error='User account is deactivated.',
                    status_code=status.HTTP_403_FORBIDDEN
                )
                            
            refresh = JWTHelper.get_tokens_for_user(user)
            
            response = success_response(
                data = {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username
                })
            
            JWTHelper.set_auth_cookies(response, str(refresh.access_token), str(refresh))
            
            return response
        
        return error_response(message='Invalid credentials', status_code=status.HTTP_401_UNAUTHORIZED)
    
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        response = success_response(message='Logged out successfully')
        JWTHelper.clear_auth_cookies(response)
        return response
    
class AdminUserManagementViewSet(ModelViewSet):
    queryset = CustomUser.objects.filter(is_superuser = False).order_by('id')
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        return AdminUserSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        display_serializer = AdminUserCreateSerializer(user)
        return success_response(data=display_serializer.data, status_code=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['patch'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return success_response(message='User status toggled')
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        return success_response(message='User deleted successfully')