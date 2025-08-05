import io
from typing import Optional
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.lib.colors import HexColor
from reportlab.platypus.flowables import HRFlowable


class InvoiceService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._register_fonts()
        self._setup_custom_styles()

    def _register_fonts(self):
        """Register fonts for better typography"""
        try:
            self.primary_font = 'Helvetica'
            self.primary_font_bold = 'Helvetica-Bold'
        except:
            self.primary_font = 'Helvetica'
            self.primary_font_bold = 'Helvetica-Bold'

    def _setup_custom_styles(self):
        """Setup custom paragraph styles for the invoice"""
        # Company name style
        self.styles.add(ParagraphStyle(
            name='CompanyName',
            parent=self.styles['Heading1'],
            fontSize=20,
            spaceAfter=4,
            alignment=TA_LEFT,
            textColor=HexColor('#000000'),
            fontName=self.primary_font_bold
        ))

        # Company subtitle style
        self.styles.add(ParagraphStyle(
            name='CompanySubtitle',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=20,
            alignment=TA_LEFT,
            textColor=HexColor('#666666'),
            fontName=self.primary_font
        ))

        # Invoice title style
        self.styles.add(ParagraphStyle(
            name='InvoiceTitle',
            parent=self.styles['Heading1'],
            fontSize=36,
            spaceAfter=30,
            alignment=TA_RIGHT,
            textColor=HexColor('#000000'),
            fontName=self.primary_font_bold
        ))

        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=8,
            textColor=HexColor('#000000'),
            fontName=self.primary_font_bold
        ))

        # Regular text style
        self.styles.add(ParagraphStyle(
            name='InvoiceText',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=4,
            textColor=HexColor('#333333'),
            fontName=self.primary_font
        ))

        # Product name style with text wrapping
        self.styles.add(ParagraphStyle(
            name='ProductName',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=2,
            textColor=HexColor('#333333'),
            fontName=self.primary_font,
            wordWrap='CJK'  # Enable word wrapping
        ))

        # Thank you style
        self.styles.add(ParagraphStyle(
            name='ThankYou',
            parent=self.styles['Normal'],
            fontSize=18,
            spaceAfter=10,
            alignment=TA_RIGHT,
            textColor=HexColor('#000000'),
            fontName=self.primary_font_bold
        ))

    def generate_invoice_pdf(self, order, company_info: Optional[dict] = None) -> bytes:
        """Generate a PDF invoice for the given order"""
        buffer = io.BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        story = []

        story.extend(self._create_header(company_info, order))

        story.append(HRFlowable(width="100%", thickness=1, color=HexColor('#000000')))
        story.append(Spacer(1, 20))

        story.extend(self._create_customer_and_invoice_info(order=order))

        story.extend(self._create_items_table(order=order))

        story.extend(self._create_totals(order=order))

        story.extend(self._create_footer(company_info=company_info))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return pdf_bytes

    def _create_header(self, company_info: dict, order) -> list:
        """Create the header with company logo area and invoice title"""
        elements = []

        # Left side - Company info
        left_content = [Paragraph(company_info.get('shop_name', 'Shop'), self.styles['CompanyName'])]

        # Right side - Invoice title
        right_content = [Paragraph("INVOICE", self.styles['InvoiceTitle'])]

        # Create header table
        header_table = Table([[left_content, right_content]], colWidths=[3.5*inch, 3.5*inch])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))

        elements.append(header_table)
        elements.append(Spacer(1, 20))

        return elements

    def _create_customer_and_invoice_info(self, order) -> list:
        """Create customer info and invoice details side by side"""
        elements = []

        customer_content = []
        customer_content.append(Paragraph("INVOICE TO :", self.styles['SectionHeader']))

        customer_name = f"{order.user.first_name} {order.user.last_name}"
        customer_content.append(Paragraph(customer_name, self.styles['InvoiceText']))

        if hasattr(order, 'shipping_address') and order.shipping_address:
            addr = order.shipping_address
            if addr.address_1:
                customer_content.append(Paragraph(addr.address_1, self.styles['InvoiceText']))
            if addr.city and addr.state:
                city_state = f"{addr.city}, {addr.state}"
                customer_content.append(Paragraph(city_state, self.styles['InvoiceText']))

        customer_content.append(Paragraph(order.user.email, self.styles['InvoiceText']))

        # Invoice details
        invoice_content = []
        invoice_content.append(Paragraph(f"Invoice No : #{order.order_number}", self.styles['InvoiceText']))
        invoice_content.append(Paragraph(f"Invoice Date : {order.created_at.strftime('%B %d, %Y')}", self.styles['InvoiceText']))

        # Create info table
        info_table = Table([[customer_content, invoice_content]], colWidths=[3.5*inch, 3.5*inch])
        info_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))

        elements.append(info_table)
        elements.append(Spacer(1, 30))

        return elements

    def _create_items_table(self, order) -> list:
        """Create the order items table with modern styling"""
        elements = []

        headers = ["NAME", "QTY", "PRICE", "TOTAL"]
        data = [headers]

        for item in order.order_items:
            item_name = item.name

            if len(item_name) > 50:
                item_name = item_name[:47] + "..."

            if hasattr(item, 'variant') and item.variant:
                variant_parts = []
                if item.variant.get('size'):
                    variant_parts.append(f"Size: {item.variant['size']}")
                if item.variant.get('color'):
                    variant_parts.append(f"Color: {item.variant['color']}")
                if variant_parts:
                    item_name += f" ({', '.join(variant_parts)})"

            item_paragraph = Paragraph(item_name, self.styles['ProductName'])

            data.append([
                item_paragraph,
                str(item.quantity),
                f"₦{item.price:,.0f}",
                f"₦{(item.price * item.quantity):,.0f}"
            ])

        # Create table with wider layout
        table = Table(data, colWidths=[4*inch, 0.8*inch, 1.2*inch, 1.2*inch])
        table.setStyle(TableStyle([
            # Header row styling
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#000000')),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), self.primary_font_bold),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),

            # Data rows styling
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#ffffff')),
            ('TEXTCOLOR', (0, 1), (-1, -1), HexColor('#333333')),
            ('FONTNAME', (0, 1), (-1, -1), self.primary_font),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 8),

            # Alignment
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),    # NAME column
            ('ALIGN', (1, 1), (-1, -1), 'CENTER'), # QTY, PRICE, TOTAL columns
            ('VALIGN', (0, 1), (-1, -1), 'TOP'),   # Vertical alignment for wrapped text

            # Grid lines
            ('LINEBELOW', (0, 0), (-1, 0), 1, HexColor('#cccccc')),
            ('LINEBELOW', (0, 1), (-1, -1), 0.5, HexColor('#e0e0e0')),

            # Alternate row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#ffffff'), HexColor('#f8f8f8')]),
        ]))

        elements.append(table)
        elements.append(Spacer(1, 30))
        return elements

    def _create_totals(self, order) -> list:
        """Create totals section and signature area"""
        elements = []

        # Totals data
        totals_data = []
        totals_data.append(["Sub-total :", f"₦{order.subtotal:,.0f}"])
        totals_data.append(["Tax :", f"₦{order.tax:,.0f}"])

        if hasattr(order, 'shipping_fee') and order.shipping_fee:
            totals_data.append(["Shipping :", f"₦{order.shipping_fee:,.0f}"])

        totals_data.append(["Total :", f"₦{order.total:,.0f}"])

        signature_content = []
        signature_content.append(Spacer(1, 40))

        totals_table = Table(totals_data, colWidths=[1.8*inch, 1.5*inch])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -2), self.primary_font),
            ('FONTNAME', (0, -1), (-1, -1), self.primary_font_bold),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('LINEABOVE', (0, -1), (-1, -1), 1, HexColor('#000000')),
            ('LINEBELOW', (0, -1), (-1, -1), 1, HexColor('#000000')),
        ]))

        # Create final layout with wider columns
        final_layout = Table([[signature_content, totals_table]], colWidths=[3.5*inch, 3.5*inch])
        final_layout.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))

        elements.append(final_layout)
        elements.append(Spacer(1, 40))

        elements.append(Paragraph("THANK YOU!", self.styles['ThankYou']))

        return elements

    def _create_footer(self, company_info: dict) -> list:
        """Create the invoice footer with contact information"""
        elements = []

        elements.append(Spacer(1, 20))
        elements.append(HRFlowable(width="100%", thickness=1, color=HexColor('#000000')))
        elements.append(Spacer(1, 10))

        phone = company_info.get('contact_phone', '+123-456-7890')
        email = company_info.get('contact_email', 'hello@reallygreatsite.com')
        address = company_info.get('address', '123 Anywhere St., Any City')

        footer_info = f"{phone}    {email}    {address}"
        elements.append(Paragraph(footer_info, self.styles['InvoiceText']))

        return elements

invoice_service = InvoiceService()
