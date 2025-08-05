from rest_framework.serializers import Serializer, ModelSerializer
from ..models import Post, Category


class PostSerializer(ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'author', 'category', 'content', 'cover_image', 'is_draft', 'created_at', 'updated_at']
        
        read_only_fields = ['author', 'created_at', 'updated_at']
        
        def create(self, validated_data):
            # handle string to boolean conversion for is_draft
            is_draft = validated_data.get('is_draft')
            if isinstance(is_draft, str):
                validated_data['is_draft'] = is_draft.lower() == 'true'
            return super().create(validated_data)    

        def update(self, instance, validated_data):
            # handle string to boolean conversion for is_draft
            is_draft = validated_data.get('is_draft')
            if isinstance(is_draft, str):
                validated_data['is_draft'] = is_draft.lower() == 'true'
            return super().update(instance, validated_data)     
        
class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name']   