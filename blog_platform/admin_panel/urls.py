from django.urls import path
from . import views
from .views import DashboardView, UsersListView, UserCreateView, UserEditView

urlpatterns = [
    path('', DashboardView.as_view(), name='admin_dashboard'),
    path('user-list/', UsersListView.as_view(), name='admin_users_list'),
    path('user-create/', UserCreateView.as_view(), name='admin_user_create'),
    path('user-edit/<int:user_id>/', UserEditView.as_view(), name='admin_user_edit'),
]


