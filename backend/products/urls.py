from django.urls import path
from .views import ProductListView, ProductDetailView, CategoryListView, FeaturedProductsView

urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),
    path('featured/', FeaturedProductsView.as_view(), name='featured-products'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
]