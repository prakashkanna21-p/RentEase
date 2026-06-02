from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_id = serializers.ReadOnlyField(source='category.id')
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'category_name', 'category_id', 
                  'description', 'monthly_rent', 'security_deposit', 
                  'image', 'is_available', 'created_at']