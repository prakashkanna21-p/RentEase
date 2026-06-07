from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.utils import timezone
import uuid
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer

class CreateOrderView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CreateOrderSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        order_number = f"RENT-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        
        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            full_name=data['full_name'],
            phone=data['phone'],
            email=data['email'],
            address=data['address'],
            city=data['city'],
            state=data['state'],
            pincode=data['pincode'],
            delivery_date=data['delivery_date'],
            delivery_note=data.get('delivery_note', ''),
            total_rent=data['total_rent'],
            total_deposit=data['total_deposit'],
            grand_total=data['grand_total'],
            status='pending'
        )
        
        for item in data['cart_items']:
            OrderItem.objects.create(
                order=order,
                product_id=item['id'],
                product_name=item['name'],
                monthly_rent=item['monthly_rent'],
                security_deposit=item['security_deposit'],
                quantity=item['quantity'],
                tenure=item['tenure'],
                total_rent=item['monthly_rent'] * item['quantity'] * item['tenure'],
                total_deposit=item['security_deposit'] * item['quantity']
            )
        
        return Response({
            'success': True,
            'order_number': order_number,
        }, status=status.HTTP_201_CREATED)

class MyOrdersView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')