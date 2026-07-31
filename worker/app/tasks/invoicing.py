async def generate_invoice_pdf(ctx, order_id: str, email: str):
    print(f"Generating invoice for order {order_id}")
    print(f"Sending invoice to {email}")
    return "Invoice generated successfully"
