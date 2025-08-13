from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from ..models import Post, Category, Comment, PostView
from .serializers import PostSerializer, CategorySerializer, UserCommentSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.renderers import JSONRenderer
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.generics import ListCreateAPIView
from core.utils.responses import success_response, error_response
import logging
from django.shortcuts import get_object_or_404
from django.db.models import Q
from ..utils.ip import get_client_ip

logger = logging.getLogger('posts')

class PostViewSet(ModelViewSet):
    queryset = Post.objects.select_related('category', 'author').all().order_by('-updated_at')
    serializer_class = PostSerializer
    permission_classes = [IsAdminUser]
    
    def perform_create(self, serializer):
        """
        Save a new post with the request user as author
        """        
        serializer.save(author=self.request.user)
        
    def create(self, request, *args, **kwargs):
        """
        Handle post creation, including form data normalization
        """
        data = request.data.copy()
        if 'category' in data:
            data['category_id'] = data['category']
            data.pop('category', None)
        if 'is_draft' in data:
            data['is_draft'] = data['is_draft'].lower() == 'true'
            
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        post = serializer.instance
        message = 'Draft saved successfully' if post.is_draft else 'Post published successfully'
        response_data = { 'id': post.id }
        return success_response(message=message, data=response_data, status_code=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """
        Update post instance with partial data
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return success_response(message='Post updated successfully')

                
    @action(detail=True, methods=['patch'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        """
        Toggle the draft status of the specified post
        """
        post = self.get_object()
        post.is_draft = not post.is_draft
        post.save()
        return success_response(message='Post status updated successfully.')
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete the specified post
        """
        post = self.get_object()
        post.delete()
        return success_response(message='Post deleted successfully.')
  
  
class CategoryView(APIView):
    """ 
    List all category
    """
    permission_classes = [IsAdminUser]
    def get(self, request):
        category_name = Category.objects.values('id','name')
        serializer = CategorySerializer(category_name, many=True)
        return success_response(data=serializer.data)
    
    
class PostLIkeStatusAPIView(APIView):
    """
    Handles retrieving like status and toggling like for a post.
    GET: Retrieve total likes and if current user liked the post.
    POST: Toggle like/unlike for the current user.
    """
    permission_classes = [IsAuthenticated]
    
    def get_post(self, pk):
        return get_object_or_404(Post.objects.prefetch_related('reactions'), pk=pk)
    
    def get(self, request, pk):
        post = self.get_post(pk)
        total_likes = post.reactions.count()
        is_liked = post.reactions.filter(user=request.user).exists()
        return success_response(data={
            'post_id': post.id,
            'total_likes': total_likes,
            'is_liked': is_liked,
        })
        
    def post(self, request, pk):
        post = self.get_post(pk)
        user = request.user
        
        liked = post.reactions.filter(user=user).exists()
        if liked:
            post.reactions.filter(user=user).delete()
            is_liked = False
            message = "Post unliked."
        else:
            post.reactions.create(user=user)
            is_liked = True
            message = "Post liked."
            
        total_likes = post.reactions.count()
        print(total_likes)
        return success_response(
            message=message,
            data={
                "post_id": post.id,
                "total_likes": total_likes,
                "is_liked": is_liked
            }
        )        
                    
        
class UserCommentListCreateView(ListCreateAPIView):
    """
    List approved comments and current user's comments for a post.
    Also allows the user to create new comments.
    """
    serializer_class = UserCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        post_id = self.request.query_params.get('post')
        if not post_id:
            return Comment.objects.none()
        
        # Approved comments for the post + current user's own comments (pending or approved)
        return Comment.objects.filter(
            post_id=post_id
        ).filter(
            Q(is_approved=True) | Q(user=user)
        ).select_related('user').order_by('-created_at')
        
class PostRecordAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self,request,post_id):
        post = get_object_or_404(Post, id=post_id)
        
        user = request.user
        
        if user.is_superuser or user.is_staff:
            return success_response(message='admin view not counted')
        
        ip = get_client_ip(request)      
        
        PostView.objects.create(user=user, post=post, ip_address=ip)
        
        post.view_count = post.view_count + 1
        post.save(update_fields=['view_count'])
        
        return success_response(message='View recorded', status_code=status.HTTP_201_CREATED)
        
        
          