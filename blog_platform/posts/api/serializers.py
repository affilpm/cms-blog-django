from rest_framework.serializers import Serializer, ModelSerializer, ValidationError
from ..models import Post, Category


class PostSerializer(ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'author', 'category', 'content', 'cover_image', 'attachment', 'is_draft', 'created_at', 'updated_at']
        
        read_only_fields = ['author', 'created_at', 'updated_at']
        
        def validate_cover_image(self, value):
            if value:
                if len(value.name) > 100:
                    raise ValidationError('Image file must be less than 100 characters.')
                allowed_image_type = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']
                if value.content_type not in allowed_image_type:
                    raise ValidationError('Please select a valid image file (JPEG, PNG, or WebP).')
                
                max_image_size = 5*1024*1024
                if value.size > max_image_size:
                    raise ValidationError('Image must be less than 5MB.')
            return value
        
        def validate_attachment(self, value):
            if value:
                if len(value.name) > 100:
                    raise ValidationError('Attachment file must be less that 100 characters.')    
                allowed_attachment_types = [
                    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'text/plain', 'application/zip', 'application/x-rar-compressed',
                    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
                    'video/mp4', 'audio/mpeg', 'audio/wav', 'audio/mp3'
                ]        
                if value.content_type not in allowed_attachment_types:
                    raise ValidationError('Unsupported file type.')
                max_attachment_size = 10 * 1024 * 1024
                if value.size > max_attachment_size:
                    raise ValidationError('File must be less than 10MB.')
            return value
            
        def get_attachment_type(self, obj):
            return obj.get_attachment_type()
        
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