from django.urls import path
from .views import HomeView, PostListView, PostDetailView

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('post-list/', PostListView.as_view(), name='post_list'),
    path('post-detail/<int:post_id>/', PostDetailView.as_view(), name='post_detail'),
    
]


