from django.contrib import admin
from django.utils.html import format_html

from .models import Order, OrderItem, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'size_ml', 'gender', 'stock', 'is_featured')
    list_filter = ('gender', 'is_featured')
    search_fields = ('name', 'short_description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'product_name', 'size_ml', 'quantity', 'price_at_purchase')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number',
        'full_name',
        'phone',
        'payment_method',
        'status',
        'payment_thumbnail',
        'total_amount',
        'created_at',
    )
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('order_number', 'full_name', 'phone', 'city')
    readonly_fields = (
        'order_number',
        'subtotal',
        'shipping',
        'total_amount',
        'created_at',
        'updated_at',
        'payment_preview',
        'processing_note',
    )
    inlines = [OrderItemInline]
    actions = ['mark_payment_verified', 'mark_processing']

    fieldsets = (
        ('Customer', {
            'fields': ('order_number', 'full_name', 'phone', 'email', 'address', 'city', 'notes'),
        }),
        ('Payment', {
            'fields': (
                'payment_method',
                'payment_screenshot',
                'payment_preview',
                'status',
                'processing_note',
            ),
        }),
        ('Totals', {
            'fields': ('subtotal', 'shipping', 'total_amount', 'created_at', 'updated_at'),
        }),
    )

    def payment_thumbnail(self, obj):
        if obj.payment_screenshot:
            return format_html(
                '<a href="{}" target="_blank">'
                '<img src="{}" style="max-height:48px;border-radius:4px;" />'
                '</a>',
                obj.payment_screenshot.url,
                obj.payment_screenshot.url,
            )
        return '—'

    payment_thumbnail.short_description = 'Screenshot'

    def payment_preview(self, obj):
        if obj.payment_screenshot:
            return format_html(
                '<a href="{}" target="_blank">'
                '<img src="{}" style="max-width:320px;border-radius:8px;border:1px solid #C9A44C;" />'
                '</a>',
                obj.payment_screenshot.url,
                obj.payment_screenshot.url,
            )
        return 'No screenshot uploaded'

    payment_preview.short_description = 'Payment proof'

    def processing_note(self, obj):
        if obj.status == Order.STATUS_PROCESSING:
            return ''
        if obj.payment_method == Order.PAYMENT_BANK and obj.status not in (
            Order.STATUS_PAYMENT_VERIFIED,
            Order.STATUS_PROCESSING,
            Order.STATUS_SHIPPED,
            Order.STATUS_DELIVERED,
        ):
            return format_html(
                '<span style="color:#C9A44C;">Note: Bank transfer orders should be '
                'marked "Payment Verified" before moving to Processing.</span>'
            )
        if obj.payment_method == Order.PAYMENT_COD:
            return format_html(
                '<span style="color:#C9A44C;">COD order — can move to Processing when ready.</span>'
            )
        return ''

    processing_note.short_description = 'Admin note'

    @admin.action(description='Mark as Payment Verified')
    def mark_payment_verified(self, request, queryset):
        updated = queryset.update(status=Order.STATUS_PAYMENT_VERIFIED)
        self.message_user(request, f'{updated} order(s) marked as Payment Verified.')

    @admin.action(description='Move to Processing')
    def mark_processing(self, request, queryset):
        count = 0
        for order in queryset:
            if order.payment_method == Order.PAYMENT_COD:
                order.status = Order.STATUS_PROCESSING
                order.save()
                count += 1
            elif order.status == Order.STATUS_PAYMENT_VERIFIED:
                order.status = Order.STATUS_PROCESSING
                order.save()
                count += 1
            else:
                self.message_user(
                    request,
                    f'Order {order.order_number}: verify payment before processing.',
                    level='warning',
                )
        if count:
            self.message_user(request, f'{count} order(s) moved to Processing.')
