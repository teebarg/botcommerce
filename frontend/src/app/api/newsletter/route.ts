// app/api/newsletter/route.ts
import fs from "fs";
import path from "path";

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import handlebars from "handlebars";

export async function POST(req: NextRequest) {
    try {
        const { to, email } = await req.json();

        // Create a transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER as string, // Your Gmail address
                pass: process.env.GMAIL_PASS as string, // Your Gmail password or app password
            },
        });

        // Read and compile the email template
        const templatePath = path.resolve("./src/email-templates/newsletter.hbs");
        const source = fs.readFileSync(templatePath, "utf8");
        const template = handlebars.compile(source);

        // Prepare the email data
        const mailOptions = {
            from: process.env.GMAIL_USER as string,
            to, // Send to user's email address
            subject: "Welcome to Our Newsletter!",
            html: template({ name: email, websiteUrl: "TBO", currentYear: new Date().getFullYear(), unsubscribeUrl: "TBO" }), // Compile the template with dynamic data
        };

        try {
            // Send the email
            await transporter.sendMail(mailOptions);

            return NextResponse.json({ message: "Email sent successfully from here" }, { status: 200 });
        } catch (error) {
            return NextResponse.json({ message: "Failed to send email", error }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ message: "An error occurred sending email", error }, { status: 500 });
    }
}
