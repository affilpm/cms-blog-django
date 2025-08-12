from rest_framework.serializers import Serializer, ModelSerializer, ValidationError, SerializerMethodField, CharField
from ..models import Post, Category, Comment
from rest_framework import serializers

class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name']   
        

class PostSerializer(serializers.ModelSerializer):
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'author', 'category_id', 'content',
            'cover_image', 'attachment', 'is_draft', 'created_at',
            'updated_at', 'category', 'view_count', 'like_count',
            'comment_count'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at', 'like_count', 'comment_count']

    def validate_category_id(self, value):
        if value:
            if not Category.objects.filter(id=value).exists():
                raise serializers.ValidationError("Invalid category selected.")
        return value

    def validate_cover_image(self, value):
        if value:
            if len(value.name) > 100:
                raise serializers.ValidationError('Image file name must be less than 100 characters.')
            allowed_types = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError('Please select a valid image file (JPEG, PNG, or WebP).')
            max_size = 5 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError('Image must be less than 5MB.')
        return value

    def validate_attachment(self, value):
        if value:
            if len(value.name) > 100:
                raise serializers.ValidationError('Attachment file name must be less than 100 characters.')
            allowed_types = [
                'application/pdf', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain', 'application/zip', 'application/x-rar-compressed',
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
                'video/mp4', 'audio/mpeg', 'audio/wav', 'audio/mp3'
            ]
            if value.content_type not in allowed_types:
                raise serializers.ValidationError('Unsupported file type.')
            max_size = 10 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError('File must be less than 10MB.')
        return value

    def get_like_count(self, obj):
        return obj.reactions.count()

    def get_comment_count(self, obj):
        return obj.comments.count()

    def create(self, validated_data):
        is_draft = validated_data.get('is_draft')
        if isinstance(is_draft, str):
            validated_data['is_draft'] = is_draft.lower() == 'true'
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'cover_image' in validated_data and validated_data['cover_image'] == '':
            validated_data['cover_image'] = None
        if 'attachment' in validated_data and validated_data['attachment'] == '':
            validated_data['attachment'] = None
        is_draft = validated_data.get('is_draft')
        if isinstance(is_draft, str):
            validated_data['is_draft'] = is_draft.lower() == 'true'
        return super().update(instance, validated_data)

class UserCommentSerializer(ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'content', 'is_approved', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'is_approved', 'created_at', 'updated_at']
        
    def create(self, validated_data):
        # Author is current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data) 