import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf_invoice(order_data, output_filename):
    """
    Generates a beautifully structured PDF invoice for an API backend.
    """
    # 1. Page Configuration & Margins
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36,
        title=f"Invoice {order_data['invoice_no']}"
    )

    # 2. Modern 2026 Brand Design Palette
    PRIMARY_COLOR = colors.HexColor("#1A1A24")  # Deep Charcoal
    ACCENT_COLOR = colors.HexColor("#2563EB")   # Electric Blue
    TEXT_DARK = colors.HexColor("#374151")      # Slate Gray
    BG_LIGHT = colors.HexColor("#F9FAFB")       # Clean light gray background
    BORDER_COLOR = colors.HexColor("#E5E7EB")   # Neutral dividing borders

    styles = getSampleStyleSheet()

    # 3. Clean Scannable Typography
    style_logo = ParagraphStyle('Logo', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=24, leading=28, textColor=PRIMARY_COLOR)
    style_inv_title = ParagraphStyle('InvTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=20, leading=24, alignment=2, textColor=ACCENT_COLOR)
    style_body = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=TEXT_DARK)
    style_th = ParagraphStyle('TH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=colors.white)
    style_th_right = ParagraphStyle('THRight', parent=style_th, alignment=2)
    style_td = ParagraphStyle('TD', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=TEXT_DARK)
    style_td_right = ParagraphStyle('TDRight', parent=style_td, alignment=2)
    style_total_lbl = ParagraphStyle('TotalLbl', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11, leading=14, alignment=2, textColor=PRIMARY_COLOR)

    story = []

    # --- HEADER BLOCK (Logo & Document Title) ---
    header_data = [
        [Paragraph(order_data['company_name'], style_logo), Paragraph("INVOICE", style_inv_title)]
    ]
    header_table = Table(header_data, colWidths=[270, 270])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 15))

    # --- METADATA BLOCK (Dates & Serial Numbers) ---
    meta_left = f"<b>From:</b><br/>{order_data['company_address']}"
    meta_right = f"<b>Invoice No:</b> {order_data['invoice_no']}<br/><b>Date:</b> {order_data['date']}<br/><b>Order ID:</b> {order_data['order_id']}<br/><b>Payment Status:</b> Paid"

    meta_data = [[Paragraph(meta_left, style_body), Paragraph(meta_right, style_body)]]
    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('PADDING', (0,0), (-1,-1), 12),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))

    # --- BILL TO BLOCK ---
    bill_to_text = f"<b>BILL TO:</b><br/>{order_data['customer_name']}<br/>{order_data['customer_address']}"
    bill_table = Table([[Paragraph(bill_to_text, style_body)]], colWidths=[540])
    bill_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 15),
    ]))
    story.append(bill_table)

    # --- LINE ITEMS TABLE ---
    items_data = [
        [Paragraph("Product Details", style_th), Paragraph("Qty", style_th_right), Paragraph("Unit Price", style_th_right), Paragraph("Total", style_th_right)]
    ]

    for item in order_data['items']:
        items_data.append([
            Paragraph(item['name'], style_td),
            Paragraph(str(item['qty']), style_td_right),
            Paragraph(item['price'], style_td_right),
            Paragraph(item['total'], style_td_right)
        ])

    items_table = Table(items_data, colWidths=[300, 40, 100, 100])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_COLOR),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, BORDER_COLOR),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 15))

    # --- TOTALS SUMMARY ---
    summary_data = [
        ["", Paragraph("Subtotal:", style_total_lbl), Paragraph(order_data['subtotal'], style_td_right)],
        ["", Paragraph("Tax:", style_total_lbl), Paragraph(f"{order_data['tax']}", style_td_right)],
        ["", Paragraph("Grand Total:", style_total_lbl), Paragraph(f"₦{order_data['total']}", style_td_right)]
    ]
    summary_table = Table(summary_data, colWidths=[240, 200, 100])
    summary_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LINEABOVE', (1,2), (2,2), 1.5, PRIMARY_COLOR),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 40))

    # --- FOOTER ---
    footer_text = "Thank you for your patronage! If you have queries regarding this statement, please contact support.<br/><i>This is a system-generated invoice. No signature required.</i>"
    footer_table = Table([[Paragraph(footer_text, style_body)]], colWidths=[540])
    footer_table.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER')]))
    story.append(footer_table)

    # Build Document PDF
    doc.build(story)

# --- Example Payload from your E-commerce API DB Query ---
sample_payload = {
    "company_name": "SHOPCORE INC.",
    "company_address": "ShopCore Fulfillment Ltd<br/>100 Tech Runway, Suite 400<br/>Austin, TX 78701",
    "invoice_no": "INV-2026-89421",
    "date": "August 10, 2026",
    "order_id": "#ORD-99210",
    "customer_name": "Jane Doe",
    "customer_address": "452 Cypress Avenue<br/>Lagos, Nigeria",
    "items": [
        {"name": "Quantum Wireless Earbuds (Gen 3)", "qty": 1, "price": 129.99},
        {"name": "Ultra-Thin MagSafe Power Bank 10k", "qty": 2, "price": 45.00},
        {"name": "Braided USB-C Fast Charging Cable (2m)", "qty": 1, "price": 19.99}
    ],
    "subtotal": 239.98,
    "tax": 18.00,
    "total": 257.98
}

# generate_pdf_invoice(sample_payload, "invoice.pdf")