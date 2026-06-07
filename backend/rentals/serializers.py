from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'monthly_rent', 
                  'security_deposit', 'quantity', 'tenure', 'total_rent', 'total_deposit']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'full_name', 'phone', 'email', 'address', 
                  'city', 'state', 'pincode', 'delivery_date', 'delivery_note',
                  'total_rent', 'total_deposit', 'grand_total', 'status', 
                  'created_at', 'updated_at', 'items']

class CreateOrderSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=15)
    email = serializers.EmailField()
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=10)
    delivery_date = serializers.DateField()
    delivery_note = serializers.CharField(required=False, allow_blank=True)
    cart_items = serializers.ListField(child=serializers.DictField())
    total_rent = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_deposit = serializers.DecimalField(max_digits=10, decimal_places=2)
    grand_total = serializers.DecimalField(max_digits=10, decimal_places=2)