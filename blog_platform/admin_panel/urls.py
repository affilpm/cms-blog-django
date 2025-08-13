from django.urls import path
from . import views
from .views import DashboardView, UsersListView, UserCreateView, UserEditView, PostListView, AdminPostDetailView, AdminCommentView

urlpatterns = [
    # path('', DashboardView.as_view(), name='admin_dashboard'),
    path('', UsersListView.as_view(), name='admin_users_list'),
    path('user-create/', UserCreateView.as_view(), name='admin_user_create'),
    path('user-edit/<int:user_id>/', UserEditView.as_view(), name='admin_user_edit'),
    
    path('post-list/', PostListView.as_view(), name='admin_post_list'),
    path('post-detail/<int:post_id>/', AdminPostDetailView.as_view(), name='admin_post_detail'),
    path('comments/', AdminCommentView.as_view(), name='admin_comments')
]


