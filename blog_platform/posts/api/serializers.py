from rest_framework.serializers import Serializer, ModelSerializer
from ..models import Post

class PostSerializer(ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']   