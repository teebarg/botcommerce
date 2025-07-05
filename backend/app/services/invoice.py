import io
from datetime import datetime
from typing import Optional
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.lib.colors import HexColor

from app.models.order import OrderResponse
from app.models.user import User


class InvoiceService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Setup custom paragraph styles for the invoice"""
        self.styles.add(ParagraphStyle(
            name='InvoiceTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=HexColor('#1f2937')
        ))

        self.styles.add(ParagraphStyle(
            name='InvoiceSubtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            textColor=HexColor('#374151')
        ))

        self.styles.add(ParagraphStyle(
            name='InvoiceText',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=6,
            textColor=HexColor('#4b5563')
        ))

    def generate_invoice_pdf(self, order: OrderResponse, user: User, company_info: Optional[dict] = None) -> bytes:
        """Generate a PDF invoice for the given order"""
        buffer = io.BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )

        story = []

        # Add company header
        if company_info:
            story.extend(self._create_company_header(company_info))

        # Add invoice title and details
        story.extend(self._create_invoice_header(order))

        # Add customer information
        story.extend(self._create_customer_info(user, order))

        # Add order items table
        story.extend(self._create_items_table(order))

        # Add totals
        story.extend(self._create_totals_section(order))

        # Add footer
        story.extend(self._create_footer())

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return pdf_bytes

    def _create_company_header(self, company_info: dict) -> list:
        """Create the company header section"""
        elements = []

        if company_info.get('name'):
            elements.append(Paragraph(company_info['name'], self.styles['InvoiceTitle']))

        if company_info.get('address'):
            elements.append(Paragraph(company_info['address'], self.styles['InvoiceText']))

        contact_info = []
        if company_info.get('phone'):
            contact_info.append(f"Phone: {company_info['phone']}")
        if company_info.get('email'):
            contact_info.append(f"Email: {company_info['email']}")

        if contact_info:
            elements.append(Paragraph(" | ".join(contact_info), self.styles['InvoiceText']))

        elements.append(Spacer(1, 20))
        return elements

    def _create_invoice_header(self, order: OrderResponse) -> list:
        """Create the invoice header section"""
        elements = []

        elements.append(Paragraph("INVOICE", self.styles['InvoiceTitle']))

        invoice_data = [
            ["Invoice Number:", order.order_number],
            ["Invoice Date:", order.created_at.strftime("%B %d, %Y")],
        ]

        invoice_table = Table(invoice_data, colWidths=[2*inch, 3*inch])
        invoice_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))

        elements.append(invoice_table)
        elements.append(Spacer(1, 20))
        return elements

    def _create_customer_info(self, user: User, order: OrderResponse) -> list:
        """Create the customer information section"""
        elements = []

        elements.append(Paragraph("Bill To:", self.styles['InvoiceSubtitle']))

        customer_name = f"{user.first_name} {user.last_name}"
        elements.append(Paragraph(customer_name, self.styles['InvoiceText']))
        elements.append(Paragraph(user.email, self.styles['InvoiceText']))

        if hasattr(order, 'shipping_address') and order.shipping_address:
            addr = order.shipping_address
            if addr.get('address_line1'):
                elements.append(Paragraph(addr['address_line1'], self.styles['InvoiceText']))
            if addr.get('city') and addr.get('state'):
                city_state = f"{addr['city']}, {addr['state']}"
                if addr.get('postal_code'):
                    city_state += f" {addr['postal_code']}"
                elements.append(Paragraph(city_state, self.styles['InvoiceText']))

        elements.append(Spacer(1, 20))
        return elements

    def _create_items_table(self, order: OrderResponse) -> list:
        """Create the order items table"""
        elements = []

        elements.append(Paragraph("Order Items:", self.styles['InvoiceSubtitle']))

        headers = ["Item", "Description", "Qty", "Unit Price", "Total"]
        data = [headers]

        for item in order.order_items:
            variant_info = ""
            if hasattr(item, 'variant') and item.variant:
                variant_parts = []
                if item.variant.get('size'):
                    variant_parts.append(f"Size: {item.variant['size']}")
                if item.variant.get('color'):
                    variant_parts.append(f"Color: {item.variant['color']}")
                if variant_parts:
                    variant_info = f" ({', '.join(variant_parts)})"

            data.append([
                item.name,
                variant_info,
                str(item.quantity),
                f"₦{item.price:,.2f}",
                f"₦{(item.price * item.quantity):,.2f}"
            ])

        table = Table(data, colWidths=[1.5*inch, 2*inch, 0.5*inch, 1*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (2, 1), (-1, -1), 'RIGHT'),
            ('ALIGN', (0, 1), (1, -1), 'LEFT'),
        ]))

        elements.append(table)
        elements.append(Spacer(1, 20))
        return elements

    def _create_totals_section(self, order: OrderResponse) -> list:
        """Create the totals section"""
        elements = []

        totals_data = [
            ["Subtotal:", f"₦{order.subtotal:,.2f}"],
            ["Tax:", f"₦{order.tax:,.2f}"],
        ]

        if hasattr(order, 'shipping_fee') and order.shipping_fee:
            totals_data.append(["Shipping:", f"₦{order.shipping_fee:,.2f}"])

        totals_data.append(["Total:", f"₦{order.total:,.2f}"])

        totals_table = Table(totals_data, colWidths=[4*inch, 1.5*inch])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, -1), (1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('LINEABOVE', (0, -1), (1, -1), 1, colors.black),
            ('LINEBELOW', (0, -1), (1, -1), 1, colors.black),
        ]))

        elements.append(totals_table)
        elements.append(Spacer(1, 30))
        return elements

    def _create_footer(self) -> list:
        """Create the invoice footer"""
        elements = []

        footer_text = "Thank you for your business!"
        elements.append(Paragraph(footer_text, self.styles['InvoiceText']))

        return elements


# Create a singleton instance
invoice_service = InvoiceService()