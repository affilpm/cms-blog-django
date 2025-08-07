from django.urls import path, include
from .views import RegistrationAPIView, LoginAPIView, LogoutAPIView, AdminUserManagementViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register(r'admin-user-management', AdminUserManagementViewSet, basename='admin_user_create')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegistrationAPIView.as_view(), name='api_register'),
    path('login/', LoginAPIView.as_view(), name='api_login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
]
