from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CategoryView, PostLIkeStatusAPIView, UserCommentListCreateView

router = DefaultRouter()
router.register(r'post', PostViewSet, basename='post')

urlpatterns = [
    path('', include(router.urls)),
    path('category/', CategoryView.as_view()),
    path('<int:pk>/like/', PostLIkeStatusAPIView.as_view(), name='post_like_status'),
    path('comments/', UserCommentListCreateView.as_view(), name='user_comment_list_create'),
    
]


