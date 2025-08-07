from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from ..models import Post, Category
from .serializers import PostSerializer, CategorySerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from core.utils.responses import success_response, error_response

class PostViewSet(ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAdminUser]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        
    def create(self, request, *args, **kwargs):
        """
        Override create to handle form data
        """    
        data = request.data.copy()
        
        if 'is_draft' in data:
            data['is_draft'] = data['is_draft'].lower() == 'true'
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        post = serializer.instance
        response_data = {
            'id': post.id,
            'redirect_url': f'/posts/{post.id}'
        }
        
        message = {'messge', 'Draft saved successfully' if post.is_draft else 'Post published succesfully'}
        return success_response(message=message, data=response_data, status_code=status.HTTP_201_CREATED)
        
                
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        post = self.get_object()
        if post.author != request.user:
            return error_response(message='Permission denied', status_code=status.HTTP_403_FORBIDDEN)
        post.publish()
        return Response({'status': 'published'})
    
    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        post = self.get_object()
        if post.author != request.user:
            return error_response(message='Permission denied', status_code=status.HTTP_403_FORBIDDEN)
        post.publish()
        return success_response(message='Published successfully', status_code=status.HTTP_201_CREATED)
    
class CategoryView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        category_name = Category.objects.values('id','name')
        serializer = CategorySerializer(category_name, many=True)
        return success_response(data=serializer.data)
