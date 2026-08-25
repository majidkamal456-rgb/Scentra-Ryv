import re

from django import forms

from .models import Order
from .validators import validate_payment_screenshot, validate_phone


class CheckoutForm(forms.ModelForm):
    payment_method = forms.ChoiceField(
        choices=Order.PAYMENT_CHOICES,
        widget=forms.RadioSelect,
        initial=Order.PAYMENT_COD,
    )
    payment_screenshot = forms.FileField(
        required=False,
        validators=[validate_payment_screenshot],
        widget=forms.ClearableFileInput(
            attrs={
                'accept': 'image/jpeg,image/png,application/pdf',
                'class': 'hidden',
                'id': 'payment-screenshot',
            }
        ),
    )

    class Meta:
        model = Order
        fields = [
            'full_name',
            'phone',
            'address',
            'city',
            'email',
            'notes',
            'payment_method',
            'payment_screenshot',
        ]
        widgets = {
            'full_name': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'Your full name',
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': '03XXXXXXXXX',
                'inputmode': 'numeric',
                'autocomplete': 'tel',
                'maxlength': '11',
                'pattern': r'03[0-9]{9}',
                'x-model': 'phone',
                '@input': 'limitPhone()',
                '@blur': 'checkPhone()',
            }),
            'address': forms.Textarea(attrs={
                'class': 'form-input',
                'rows': 3,
                'placeholder': 'House no, street, area',
            }),
            'city': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'City',
                'x-model': 'city',
                'autocomplete': 'address-level2',
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-input',
                'placeholder': 'Email (optional)',
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-input',
                'rows': 2,
                'placeholder': 'Order notes (optional)',
            }),
        }

    def clean_phone(self):
        phone = re.sub(r'\D', '', self.cleaned_data['phone'].strip())
        if phone.startswith('92') and len(phone) == 12:
            phone = '0' + phone[2:]
        validate_phone(phone)
        return phone

    def clean(self):
        cleaned = super().clean()
        payment_method = cleaned.get('payment_method')
        screenshot = cleaned.get('payment_screenshot')

        if payment_method == Order.PAYMENT_BANK and not screenshot:
            self.add_error(
                'payment_screenshot',
                'Payment screenshot is required for bank transfer orders.',
            )
        return cleaned


class ReturnRequestForm(forms.Form):
    REASON_CHOICES = [
        ('damaged', 'Damaged or leaked in transit'),
        ('wrong_item', 'Wrong product received'),
        ('not_as_described', 'Product not as described'),
        ('quality', 'Quality concern'),
        ('other', 'Other'),
    ]

    full_name = forms.CharField(
        max_length=200,
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': 'Your full name',
        }),
    )
    phone = forms.CharField(
        max_length=11,
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': '03XXXXXXXXX',
            'inputmode': 'numeric',
            'autocomplete': 'tel',
            'maxlength': '11',
        }),
    )
    email = forms.EmailField(
        required=False,
        widget=forms.EmailInput(attrs={
            'class': 'form-input',
            'placeholder': 'Email (optional)',
        }),
    )
    order_number = forms.CharField(
        max_length=50,
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': 'e.g. SR-20260825-ABC123',
        }),
    )
    product_name = forms.CharField(
        max_length=200,
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': 'Perfume name from your order',
        }),
    )
    reason = forms.ChoiceField(
        choices=REASON_CHOICES,
        widget=forms.Select(attrs={'class': 'form-input'}),
    )
    details = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-input',
            'rows': 4,
            'placeholder': 'Tell us what happened and how we can help',
        }),
    )
    photo = forms.FileField(
        required=False,
        validators=[validate_payment_screenshot],
        widget=forms.ClearableFileInput(attrs={
            'class': 'form-input',
            'accept': 'image/jpeg,image/png,application/pdf',
        }),
    )

    def clean_phone(self):
        phone = re.sub(r'\D', '', self.cleaned_data['phone'].strip())
        if phone.startswith('92') and len(phone) == 12:
            phone = '0' + phone[2:]
        validate_phone(phone)
        return phone
