from django.urls import path
from . import views
from .views import DashboardView, UsersListView

urlpatterns = [
    path('', DashboardView.as_view(), name='admin_dashboard'),
    path('list/', UsersListView.as_view(), name='admin_users_list')
    
]


