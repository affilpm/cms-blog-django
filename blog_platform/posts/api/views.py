from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from ..models import Post, Category
from .serializers import PostSerializer, CategorySerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.renderers import JSONRenderer
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from core.utils.responses import success_response, error_response
import logging

logger = logging.getLogger('posts')

class PostViewSet(ModelViewSet):
    queryset = Post.objects.select_related('category', 'author').all()
    serializer_class = PostSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """Override to ensure we always get fresh data"""
        return Post.objects.select_related('category', 'author').all()
    
    def retrieve(self, request, *args, **kwargs):
        """
        Override retrieve to ensure proper data fetching
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        
    def create(self, request, *args, **kwargs):
        """
        Override create to handle form data
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
        response_data = {
            'id': post.id,
        }
        
        message = 'Draft saved successfully' if post.is_draft else 'Post published successfully'
        return success_response(message=message, data=response_data, status_code=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            self.perform_update(serializer)
            return success_response(message='Post updated successfully')
        else:
            return error_response(message='Validation failed', error=serializer.errors)

                
    @action(detail=True, methods=['patch'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        post = self.get_object()
        post.is_draft = not post.is_draft
        post.save()
        return success_response(message='Post status updated successfully.')
    
    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        post.delete()
        return success_response(message='Post deleted successfully.')
  
  
class CategoryView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        category_name = Category.objects.values('id','name')
        serializer = CategorySerializer(category_name, many=True)
        return success_response(data=serializer.data)
