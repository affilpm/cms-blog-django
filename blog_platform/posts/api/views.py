from rest_framework.viewsets import ModelViewSet
from ..models import Post
from .serializers import PostSerializer
from rest_framework.permissions import IsAuthenticated

class PostViewSet(ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)