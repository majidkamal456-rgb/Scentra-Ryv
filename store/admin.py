from decimal import Decimal

from django import forms
from django.contrib import admin, messages
from django.db.models import Sum, Avg, Count
from django.shortcuts import redirect
from django.urls import path
from django.utils.html import format_html, mark_safe

from .models import (
    FlashipCnAudit,
    Order,
    OrderItem,
    Product,
    ProductImage,
    ProductReview,
    StoreSettings,
)


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


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'rating', 'is_approved', 'has_media', 'created_at')
    list_filter = ('rating', 'is_approved', 'created_at')
    search_fields = ('name', 'comment', 'product__name')
    list_editable = ('is_approved',)
    readonly_fields = ('created_at', 'media_preview')

    fieldsets = (
        (None, {
            'fields': ('product', 'name', 'rating', 'comment', 'is_approved', 'created_at'),
        }),
        ('Media', {
            'fields': ('image', 'video', 'media_preview'),
        }),
    )

    def has_media(self, obj):
        return bool(obj.image or obj.video)

    has_media.boolean = True
    has_media.short_description = 'Media'

    def media_preview(self, obj):
        parts = []
        if obj.image:
            parts.append(
                format_html(
                    '<a href="{}" target="_blank"><img src="{}" style="max-height:120px;border-radius:6px;" /></a>',
                    obj.image.url,
                    obj.image.url,
                )
            )
        if obj.video:
            parts.append(
                format_html(
                    '<a href="{}" target="_blank">Video file</a>',
                    obj.video.url,
                )
            )
        return format_html('<br>'.join(['{}'] * len(parts)), *parts) if parts else '—'

    media_preview.short_description = 'Preview'


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
        'city',
        'free_tester_name',
        'payment_method',
        'status',
        'flaship_courier_code',
        'flaship_tracking_number',
        'payment_thumbnail',
        'total_amount',
        'created_at',
    )
    list_filter = ('status', 'payment_method', 'flaship_courier_code', 'created_at')
    search_fields = (
        'order_number',
        'full_name',
        'phone',
        'city',
        'flaship_tracking_number',
        'flaship_booking_id',
    )
    readonly_fields = (
        'order_number',
        'subtotal',
        'shipping',
        'total_amount',
        'created_at',
        'updated_at',
        'payment_preview',
        'processing_note',
        'flaship_booking_id',
        'flaship_tracking_number',
        'flaship_courier_code',
        'flaship_booking_status',
        'flaship_label_url',
        'flaship_booking_error',
    )
    inlines = [OrderItemInline]
    actions = ['mark_payment_verified', 'mark_processing', 'book_on_flaship']

    fieldsets = (
        ('Customer', {
            'fields': ('order_number', 'full_name', 'phone', 'email', 'address', 'city', 'notes'),
        }),
        ('Offer', {
            'fields': ('free_tester', 'free_tester_name'),
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
        ('Flaship courier', {
            'fields': (
                'flaship_booking_id',
                'flaship_tracking_number',
                'flaship_courier_code',
                'flaship_booking_status',
                'flaship_label_url',
                'flaship_booking_error',
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
            return mark_safe(
                '<span style="color:#C9A44C;">Note: Bank transfer orders should be '
                'marked "Payment Verified" before moving to Processing.</span>'
            )
        if obj.payment_method == Order.PAYMENT_COD:
            return mark_safe(
                '<span style="color:#C9A44C;">COD order — can move to Processing when ready.</span>'
            )
        return ''

    processing_note.short_description = 'Admin note'

    def _book_flaship_after_payment(self, request, order):
        """Book Flaship once bank payment is verified (COD amount 0)."""
        from .flaship import book_order_shipment

        if order.flaship_tracking_number:
            return
        result = book_order_shipment(order)
        if result.get('ok'):
            if not result.get('skipped'):
                self.message_user(
                    request,
                    (
                        f'{order.order_number}: booked on Flaship — '
                        f'{result.get("courier_code")} {result.get("tracking_number")}'
                    ),
                )
            return
        self.message_user(
            request,
            f'{order.order_number} verified but Flaship book failed: {result.get("error")}',
            level=messages.WARNING,
        )

    def save_model(self, request, obj, form, change):
        previous_status = None
        if change and obj.pk:
            previous_status = (
                Order.objects.filter(pk=obj.pk).values_list('status', flat=True).first()
            )
        super().save_model(request, obj, form, change)
        # Status dropdown → Payment Verified (bank) also books Flaship
        if obj.status == Order.STATUS_PAYMENT_VERIFIED and previous_status != Order.STATUS_PAYMENT_VERIFIED:
            self._book_flaship_after_payment(request, obj)

    @admin.action(description='Mark as Payment Verified (+ book Flaship)')
    def mark_payment_verified(self, request, queryset):
        updated = 0
        for order in queryset:
            order.status = Order.STATUS_PAYMENT_VERIFIED
            order.save(update_fields=['status', 'updated_at'])
            updated += 1
            self._book_flaship_after_payment(request, order)
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

    @admin.action(description='Book / re-book on Flaship')
    def book_on_flaship(self, request, queryset):
        from .flaship import book_order_shipment

        ok = 0
        for order in queryset:
            result = book_order_shipment(order, force=True)
            if result.get('ok'):
                ok += 1
                self.message_user(
                    request,
                    f'{order.order_number}: {result.get("courier_code")} '
                    f'{result.get("tracking_number")}',
                )
            else:
                self.message_user(
                    request,
                    f'{order.order_number}: {result.get("error")}',
                    level='error',
                )
        if ok:
            self.message_user(request, f'{ok} shipment(s) booked on Flaship.')


class StoreSettingsForm(forms.ModelForm):
    class Meta:
        model = StoreSettings
        fields = ('flaship_pickup_id',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .flaship import pickup_admin_choices

        choices = [('', '— Auto (only pickup / Flaship default) —')]
        try:
            choices.extend((str(pid), label) for pid, label in pickup_admin_choices())
        except Exception:
            pass
        self.fields['flaship_pickup_id'] = forms.TypedChoiceField(
            choices=choices,
            coerce=lambda v: int(v) if v not in (None, '') else None,
            required=False,
            empty_value=None,
            label='Flaship pickup location',
            help_text=(
                'Admin only — customers never see this on checkout. '
                'If only one pickup exists it is used automatically.'
            ),
        )


@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    form = StoreSettingsForm
    list_display = ('summary', 'flaship_pickup_id', 'flaship_pickup_label', 'updated_at')
    readonly_fields = ('flaship_pickup_label', 'updated_at')

    fieldsets = (
        ('Courier booking (admin only)', {
            'description': (
                'Pickup location is used when creating Flaship bookings. '
                'It is never shown on the public checkout page.'
            ),
            'fields': ('flaship_pickup_id', 'flaship_pickup_label', 'updated_at'),
        }),
    )

    def summary(self, obj):
        return str(obj)

    summary.short_description = 'Settings'

    def has_add_permission(self, request):
        return not StoreSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def save_model(self, request, obj, form, change):
        pickup_id = form.cleaned_data.get('flaship_pickup_id')
        obj.flaship_pickup_id = pickup_id
        label = ''
        if pickup_id:
            from .flaship import pickup_admin_choices

            for pid, text in pickup_admin_choices():
                if pid == pickup_id:
                    label = text
                    break
        obj.flaship_pickup_label = label
        super().save_model(request, obj, form, change)
        self.message_user(
            request,
            f'Pickup updated: {label or "Auto (dynamic default)"}. Checkout page unchanged.',
        )


@admin.register(FlashipCnAudit)
class FlashipCnAuditAdmin(admin.ModelAdmin):
    """CN charges + margin/profit audit from Flaship payments API."""

    change_list_template = 'admin/store/flashipcnaudit/change_list.html'
    list_display = (
        'tracking_number',
        'order_link',
        'courier_code',
        'settlement_status',
        'shipment_status',
        'cod_amount',
        'customer_shipping',
        'total_charges',
        'delivery_charges',
        'shipping_profit_col',
        'shipping_margin_col',
        'contribution_profit_col',
        'contribution_margin_col',
        'synced_at',
    )
    list_filter = ('settlement_status', 'finance_status', 'courier_code', 'shipment_status')
    search_fields = ('tracking_number', 'order_number', 'external_ref_no', 'cheque_no')
    readonly_fields = (
        'tracking_number',
        'order',
        'order_number',
        'external_ref_no',
        'courier_code',
        'shipment_status',
        'finance_status',
        'settlement_status',
        'settlement_date',
        'cheque_no',
        'arrival_weight',
        'cod_amount',
        'paid_amount',
        'line_net',
        'delivery_charges',
        'service_charges',
        'osa_charges',
        'core_charges',
        'income_tax',
        'withholding_tax',
        'total_charges',
        'customer_shipping',
        'order_subtotal',
        'order_total',
        'shipping_profit',
        'shipping_margin_pct',
        'contribution_profit',
        'contribution_margin_pct',
        'raw_payload',
        'synced_at',
        'created_at',
    )
    actions = ['resync_selected']
    ordering = ('-synced_at',)

    fieldsets = (
        ('CN / order', {
            'fields': (
                'tracking_number',
                'order',
                'order_number',
                'external_ref_no',
                'courier_code',
                'shipment_status',
                'finance_status',
                'settlement_status',
                'settlement_date',
                'cheque_no',
                'arrival_weight',
            ),
        }),
        ('Charges on CN (Flaship)', {
            'fields': (
                'delivery_charges',
                'service_charges',
                'osa_charges',
                'core_charges',
                'income_tax',
                'withholding_tax',
                'total_charges',
                'cod_amount',
                'paid_amount',
                'line_net',
            ),
        }),
        ('Store order vs margin', {
            'description': (
                'Shipping profit = customer DC − CN total charges. '
                'Contribution = order subtotal − CN total charges.'
            ),
            'fields': (
                'customer_shipping',
                'order_subtotal',
                'order_total',
                'shipping_profit',
                'shipping_margin_pct',
                'contribution_profit',
                'contribution_margin_pct',
            ),
        }),
        ('Meta', {
            'classes': ('collapse',),
            'fields': ('raw_payload', 'synced_at', 'created_at'),
        }),
    )

    def has_add_permission(self, request):
        return False

    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                'sync-flaship/',
                self.admin_site.admin_view(self.sync_flaship_view),
                name='store_flashipcnaudit_sync',
            ),
        ]
        return custom + urls

    def sync_flaship_view(self, request):
        from .flaship import sync_payment_audits

        result = sync_payment_audits()
        if result.get('ok'):
            self.message_user(
                request,
                (
                    f"Payments: {result.get('fetched', 0)} fetched "
                    f"({result.get('created', 0)} new, {result.get('updated', 0)} updated). "
                    f"Orders/CN: {result.get('orders_fetched', 0)} fetched "
                    f"({result.get('orders_created', 0)} new, {result.get('orders_updated', 0)} updated). "
                    f"On-route CNs ab list mein dikhne chahiye."
                ),
                level=messages.SUCCESS,
            )
        else:
            self.message_user(request, 'Flaship sync failed.', level=messages.ERROR)
        return redirect('admin:store_flashipcnaudit_changelist')

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        qs = self.get_queryset(request)
        agg = qs.aggregate(
            cn_count=Count('id'),
            sum_total_charges=Sum('total_charges'),
            sum_delivery=Sum('delivery_charges'),
            sum_customer_shipping=Sum('customer_shipping'),
            sum_shipping_profit=Sum('shipping_profit'),
            avg_shipping_margin=Avg('shipping_margin_pct'),
            sum_contribution=Sum('contribution_profit'),
            avg_contribution_margin=Avg('contribution_margin_pct'),
            sum_cod=Sum('cod_amount'),
            sum_order_subtotal=Sum('order_subtotal'),
        )

        def money(v):
            if v is None:
                return Decimal('0.00')
            return v

        extra_context['audit_summary'] = {
            'cn_count': agg['cn_count'] or 0,
            'sum_total_charges': money(agg['sum_total_charges']),
            'sum_delivery': money(agg['sum_delivery']),
            'sum_customer_shipping': money(agg['sum_customer_shipping']),
            'sum_shipping_profit': money(agg['sum_shipping_profit']),
            'avg_shipping_margin': money(agg['avg_shipping_margin']),
            'sum_contribution': money(agg['sum_contribution']),
            'avg_contribution_margin': money(agg['avg_contribution_margin']),
            'sum_cod': money(agg['sum_cod']),
            'sum_order_subtotal': money(agg['sum_order_subtotal']),
        }
        return super().changelist_view(request, extra_context=extra_context)

    @admin.action(description='Re-sync selected CNs from Flaship')
    def resync_selected(self, request, queryset):
        from .flaship import sync_payment_audits

        # Full sync keeps pagination simple; selected rows refresh via full pull
        result = sync_payment_audits()
        self.message_user(
            request,
            f"Flaship sync done: fetched {result.get('fetched', 0)}, "
            f"created {result.get('created', 0)}, updated {result.get('updated', 0)}.",
        )

    def order_link(self, obj):
        if obj.order_id and obj.order_number:
            return format_html(
                '<a href="/admin/store/order/{}/change/">{}</a>',
                obj.order_id,
                obj.order_number,
            )
        return obj.order_number or '—'

    order_link.short_description = 'Order'

    def _money_color(self, value):
        cls = 'is-pos' if value >= 0 else 'is-neg'
        return format_html('<span class="value {}" style="font-size:0.95rem;">{}</span>', cls, value)

    def shipping_profit_col(self, obj):
        return self._money_color(obj.shipping_profit)

    shipping_profit_col.short_description = 'Ship profit'
    shipping_profit_col.admin_order_field = 'shipping_profit'

    def shipping_margin_col(self, obj):
        return self._money_color(obj.shipping_margin_pct)

    shipping_margin_col.short_description = 'Ship margin %'
    shipping_margin_col.admin_order_field = 'shipping_margin_pct'

    def contribution_profit_col(self, obj):
        return self._money_color(obj.contribution_profit)

    contribution_profit_col.short_description = 'Contribution'
    contribution_profit_col.admin_order_field = 'contribution_profit'

    def contribution_margin_col(self, obj):
        return self._money_color(obj.contribution_margin_pct)

    contribution_margin_col.short_description = 'Contrib margin %'
    contribution_margin_col.admin_order_field = 'contribution_margin_pct'
