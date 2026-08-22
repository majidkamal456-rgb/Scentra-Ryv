from django.db import models
from django.urls import reverse
from django.utils.text import slugify


class Product(models.Model):
    GENDER_CHOICES = [
        ('unisex', 'Unisex'),
        ('men', 'Men'),
        ('women', 'Women'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.CharField(max_length=255)
    description = models.TextField()
    top_notes = models.CharField(max_length=255)
    heart_notes = models.CharField(max_length=255)
    base_notes = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size_ml = models.CharField(max_length=20, default='100ml')
    stock = models.PositiveIntegerField(default=50)
    image_main = models.ImageField(upload_to='products/', blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='unisex')
    is_featured = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('store:product_detail', kwargs={'slug': self.slug})

    @property
    def in_stock(self):
        return self.stock > 0


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/gallery/')
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.product.name} — image {self.pk}'


class Order(models.Model):
    PAYMENT_COD = 'cod'
    PAYMENT_BANK = 'bank_transfer'
    PAYMENT_CHOICES = [
        (PAYMENT_COD, 'Cash on Delivery'),
        (PAYMENT_BANK, 'Bank Transfer'),
    ]

    STATUS_PENDING_COD = 'pending_cod'
    STATUS_PENDING_VERIFICATION = 'pending_verification'
    STATUS_PAYMENT_VERIFIED = 'payment_verified'
    STATUS_PROCESSING = 'processing'
    STATUS_SHIPPED = 'shipped'
    STATUS_DELIVERED = 'delivered'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_PENDING_COD, 'Pending - COD'),
        (STATUS_PENDING_VERIFICATION, 'Pending - Awaiting Payment Verification'),
        (STATUS_PAYMENT_VERIFIED, 'Payment Verified'),
        (STATUS_PROCESSING, 'Processing'),
        (STATUS_SHIPPED, 'Shipped'),
        (STATUS_DELIVERED, 'Delivered'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    order_number = models.CharField(max_length=20, unique=True, editable=False)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    payment_screenshot = models.ImageField(
        upload_to='payment_proofs/',
        blank=True,
        null=True,
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Order {self.order_number}'

    def save(self, *args, **kwargs):
        if not self.order_number:
            from django.utils import timezone
            import random
            timestamp = timezone.now().strftime('%y%m%d')
            random_suffix = random.randint(1000, 9999)
            self.order_number = f'SR-{timestamp}-{random_suffix}'
        super().save(*args, **kwargs)

    @property
    def can_move_to_processing(self):
        return (
            self.status in (self.STATUS_PENDING_COD, self.STATUS_PAYMENT_VERIFIED)
            and self.payment_method == self.PAYMENT_COD
            or self.status == self.STATUS_PAYMENT_VERIFIED
        )


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=200)
    size_ml = models.CharField(max_length=20)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.quantity}x {self.product_name}'

    @property
    def line_total(self):
        return self.price_at_purchase * self.quantity
