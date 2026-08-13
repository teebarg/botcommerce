from app.tasks.carts import process_abandoned_carts
from app.tasks.generic import contact_form, process_newsletter, process_bulk_purchase
from app.tasks.test import test_email
from app.tasks.product_images import optimize_product_image
from app.tasks.orders import order_created, process_referral, generate_and_send_invoice
from app.tasks.user_register import user_register
from app.tasks.products import update_product_embeddings

all_ecommerce_tasks = [
    generate_and_send_invoice,
    update_product_embeddings,
    user_register,
    process_referral,
    order_created,
    optimize_product_image,
    test_email,
    contact_form,
    process_newsletter,
    process_bulk_purchase,
    process_abandoned_carts
]
