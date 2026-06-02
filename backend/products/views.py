from rest_framework import generics, permissions, filters
from rest_framework.response import Response
from django.db.models import Q
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer

class ProductListView(generics.ListAPIView):
    """List all available products with search and filter"""
    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_available=True)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Search query
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    """Get single product details"""
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)

class CategoryListView(generics.ListAPIView):
    """List all categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)

class FeaturedProductsView(generics.ListAPIView):
    """Get featured/newest products"""
    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)
    
    def get_queryset(self):
        return Product.objects.filter(is_available=True).order_by('-created_at')[:8]