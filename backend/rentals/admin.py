from django.contrib import admin
from .models import Order, OrderItem, MaintenanceRequest

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'quantity', 'tenure', 'total_rent', 'total_deposit']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'full_name', 'phone', 'status', 'grand_total', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'full_name', 'phone', 'email']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    inlines = [OrderItemInline]

@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ['product_name', 'user', 'issue_type', 'priority', 'status', 'created_at']
    list_filter = ['priority', 'status', 'created_at']
    search_fields = ['product_name', 'description', 'user__email']