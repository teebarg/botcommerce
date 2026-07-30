from app.tasks.products import update_product_embeddings
from .invoicing import generate_invoice_pdf
from .communications import send_order_email

# A unified list holding all application tasks
all_ecommerce_tasks = [
    generate_invoice_pdf,
    send_order_email,
    update_product_embeddings,
]
