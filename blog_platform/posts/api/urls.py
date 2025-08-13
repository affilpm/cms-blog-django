from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CategoryView, PostLIkeStatusAPIView, UserCommentListCreateView, PostRecordAPIView, CommentApprovalStatusAPIView

router = DefaultRouter()
router.register(r'post', PostViewSet, basename='post')

urlpatterns = [
    path('', include(router.urls)),
    path('category/', CategoryView.as_view()),
    path('<int:pk>/like/', PostLIkeStatusAPIView.as_view(), name='post_like_status'),
    path('comments/', UserCommentListCreateView.as_view(), name='user_comment_list_create'),
    path('<int:post_id>/view/', PostRecordAPIView.as_view(), name='view'),
    path('<int:comment_id>/toggle-comment/', CommentApprovalStatusAPIView.as_view(), name='toggle_comment'),
    path('approve-comments/', CommentApprovalStatusAPIView.as_view(), name='approve_comments'),
    
    
]


