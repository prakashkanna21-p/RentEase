from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Sum, Q
from datetime import timedelta
import uuid
from .models import Order, OrderItem, MaintenanceRequest
from .serializers import OrderSerializer, CreateOrderSerializer, MaintenanceRequestSerializer, CreateMaintenanceRequestSerializer

class CreateOrderView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CreateOrderSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        order_number = f"RENT-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        
        try:
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
                total_rent=float(data['total_rent']),
                total_deposit=float(data['total_deposit']),
                grand_total=float(data['grand_total']),
                status='pending'
            )
            
            for item in data['cart_items']:
                OrderItem.objects.create(
                    order=order,
                    product_id=int(item['id']),
                    product_name=item['name'],
                    monthly_rent=float(item['monthly_rent']),
                    security_deposit=float(item['security_deposit']),
                    quantity=int(item['quantity']),
                    tenure=int(item['tenure']),
                    total_rent=float(item['monthly_rent']) * int(item['quantity']) * int(item['tenure']),
                    total_deposit=float(item['security_deposit']) * int(item['quantity'])
                )
            
            return Response({
                'success': True,
                'order_number': order_number,
                'message': 'Order placed successfully!'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class MyOrdersView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class CreateMaintenanceRequestView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CreateMaintenanceRequestSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        try:
            order = Order.objects.get(id=data['order_id'], user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        maintenance_request = MaintenanceRequest.objects.create(
            user=request.user,
            order=order,
            product_name=data['product_name'],
            issue_type=data['issue_type'],
            description=data['description'],
            priority=data['priority'],
            images=data.get('images', ''),
            status='pending'
        )
        
        return Response({
            'success': True,
            'message': 'Maintenance request submitted successfully',
            'request_id': maintenance_request.id
        }, status=status.HTTP_201_CREATED)

class MyMaintenanceRequestsView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = MaintenanceRequestSerializer
    
    def get_queryset(self):
        return MaintenanceRequest.objects.filter(user=self.request.user).order_by('-created_at')

class AdminMaintenanceRequestsView(generics.ListAPIView):
    permission_classes = (permissions.IsAdminUser,)
    serializer_class = MaintenanceRequestSerializer
    
    def get_queryset(self):
        return MaintenanceRequest.objects.all().order_by('-created_at')

class UpdateMaintenanceRequestView(generics.UpdateAPIView):
    permission_classes = (permissions.IsAdminUser,)
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceRequestSerializer
    partial = True

class AnalyticsView(generics.GenericAPIView):
    permission_classes = (permissions.IsAdminUser,)
    
    def get(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()
        completed_orders = Order.objects.filter(status='completed').count()
        
        total_revenue = Order.objects.aggregate(total=Sum('grand_total'))['total'] or 0
        monthly_revenue = Order.objects.filter(created_at__gte=month_ago).aggregate(total=Sum('grand_total'))['total'] or 0
        weekly_revenue = Order.objects.filter(created_at__gte=week_ago).aggregate(total=Sum('grand_total'))['total'] or 0
        
        order_items = OrderItem.objects.all()
        product_popularity = {}
        for item in order_items:
            if item.product_name in product_popularity:
                product_popularity[item.product_name] += item.quantity
            else:
                product_popularity[item.product_name] = item.quantity
        
        top_products = sorted(product_popularity.items(), key=lambda x: x[1], reverse=True)[:5]
        
        total_maintenance = MaintenanceRequest.objects.count()
        pending_maintenance = MaintenanceRequest.objects.filter(status='pending').count()
        resolved_maintenance = MaintenanceRequest.objects.filter(status='resolved').count()
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        return Response({
            'orders': {
                'total': total_orders,
                'pending': pending_orders,
                'completed': completed_orders,
            },
            'revenue': {
                'total': total_revenue,
                'monthly': monthly_revenue,
                'weekly': weekly_revenue,
            },
            'products': {
                'top_products': [{'name': name, 'count': count} for name, count in top_products],
            },
            'maintenance': {
                'total': total_maintenance,
                'pending': pending_maintenance,
                'resolved': resolved_maintenance,
            },
            'users': {
                'total': total_users,
                'active': active_users,
            }
        })