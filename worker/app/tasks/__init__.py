from app.tasks.products import update_product_embeddings
from app.tasks.invoicing import generate_invoice_pdf
from app.tasks.communications import send_order_email

all_ecommerce_tasks = [
    generate_invoice_pdf,
    send_order_email,
    update_product_embeddings,
]
