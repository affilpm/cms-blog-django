from rest_framework.serializers import Serializer, ModelSerializer, ValidationError, SerializerMethodField, CharField
from ..models import Post, Category
from rest_framework import serializers

class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name']   
        
        
class PostSerializer(ModelSerializer):
    like_count = SerializerMethodField()
    unlike_count = SerializerMethodField()
    comment_count = SerializerMethodField()
    category = CategorySerializer(read_only=True) 
    category_id = serializers.IntegerField(write_only=True, required=False) 
    def validate_category_id(self, value):
        if value:
            try:
                Category.objects.get(id=value)
            except Category.DoesNotExist:
                raise ValidationError("Invalid category selected.")
        return value
    class Meta:
        model = Post
        fields = ['id', 'title', 'author', 'category_id', 'content', 'cover_image', 'attachment', 'is_draft', 'created_at', 'updated_at', 'category', 'view_count', 'like_count', 'unlike_count', 'comment_count']
        
        read_only_fields = ['author', 'created_at', 'updated_at', 'like_count', 'unlike_count', 'comment_count']
        
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
            if 'cover_image' in validated_data and validated_data['cover_image'] == '':
                validated_data['cover_image'] = None
                
            if 'attachment' in validated_data and validated_data['attachment'] == '':
                validated_data['attachment'] = None    
                
            # handle string to boolean conversion for is_draft
            is_draft = validated_data.get('is_draft')
            if isinstance(is_draft, str):
                validated_data['is_draft'] = is_draft.lower() == 'true'
            return super().update(instance, validated_data)    
        
    def get_like_count(self, obj):
        return obj.reactions.filter(reaction_type='like').count()
        
    def get_unlike_count(self, obj):
        return obj.reactions.filter(reaction_type='unlike').count()
        
    def get_comment_count(self, obj):
        return obj.comments.count() 
    
   
