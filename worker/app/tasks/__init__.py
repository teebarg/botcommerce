from app.tasks.orders import order_created, process_referral, generate_and_send_invoice
from app.tasks.user_register import user_register
from app.tasks.products import update_product_embeddings

all_ecommerce_tasks = [
    generate_and_send_invoice,
    update_product_embeddings,
    user_register,
    process_referral,
    order_created
]
