const nodemailer = require('nodemailer');
const pool = require('../lib/db');
const { serializeError } = require('../lib/errorHandler');
const { cuid } = require('../lib/cuid');

// Ensure table exists safely
let tableInitialized = false;
async function ensureTableExists() {
  if (tableInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`manual_invoices\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`invoice_number\` VARCHAR(100) NOT NULL UNIQUE,
        \`invoice_date\` VARCHAR(50) NOT NULL,
        \`due_date\` VARCHAR(50) DEFAULT NULL,
        \`customer_name\` VARCHAR(191) NOT NULL,
        \`customer_email\` VARCHAR(191) DEFAULT NULL,
        \`customer_phone\` VARCHAR(50) DEFAULT NULL,
        \`customer_address\` TEXT DEFAULT NULL,
        \`customer_gstin\` VARCHAR(50) DEFAULT NULL,
        \`payment_method\` VARCHAR(50) DEFAULT 'Cash',
        \`payment_status\` VARCHAR(50) DEFAULT 'Paid',
        \`items\` LONGTEXT NOT NULL,
        \`subtotal\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`tax_rate\` DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
        \`tax_amount\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`discount_amount\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`shipping_charge\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`grand_total\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`notes\` TEXT DEFAULT NULL,
        \`email_sent\` TINYINT(1) NOT NULL DEFAULT 0,
        \`last_email_sent_at\` DATETIME NULL DEFAULT NULL,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_invoice_number\` (\`invoice_number\`),
        INDEX \`idx_customer_email\` (\`customer_email\`),
        INDEX \`idx_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableInitialized = true;
  } catch (err) {
    console.error('Failed to auto-create manual_invoices table:', err.message);
  }
}

// Mailer transporter helper
function getMailer() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('SMTP credentials are not configured in environment variables');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

// Helper: send invoice email with PDF attachment
async function sendInvoiceEmailHelper({ to, customerName, invoiceNumber, invoiceDate, grandTotal, pdfBase64, paymentStatus }) {
  const mailer = getMailer();

  const formattedAmount = Number(grandTotal || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f4; margin: 0; padding: 24px; color: #2c2523; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e7e5e4; }
        .header { background: #8b1a2b; color: #ffffff; padding: 32px 28px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; color: #1c1917; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.6; color: #57534e; margin-bottom: 24px; }
        .invoice-card { background: #faf8f5; border: 1px solid #ebd9c8; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .card-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e7e5e4; font-size: 14px; }
        .card-row:last-child { border-bottom: none; padding-top: 10px; font-size: 16px; font-weight: 700; color: #8b1a2b; }
        .label { color: #78716c; }
        .value { color: #1c1917; font-weight: 600; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .badge-paid { background: #dcfce7; color: #15803d; }
        .badge-pending { background: #fef3c7; color: #b45309; }
        .notice { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px 16px; font-size: 13px; color: #166534; margin-bottom: 24px; }
        .footer { background: #fafaf9; border-top: 1px solid #e7e5e4; padding: 20px 28px; text-align: center; font-size: 12px; color: #a8a29e; }
        .footer p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>Neela's Sarees</h1>
          <p>Handcrafted Elegance & Authentic Weaves</p>
        </div>
        <div class="content">
          <div class="greeting">Dear ${customerName || 'Valued Customer'},</div>
          <p class="message">
            Thank you for shopping with <strong>Neela's Sarees</strong>! Your invoice has been generated and is attached to this email as a PDF for your records.
          </p>

          <div class="invoice-card">
            <div class="card-row">
              <span class="label">Invoice Number</span>
              <span class="value">#${invoiceNumber}</span>
            </div>
            <div class="card-row">
              <span class="label">Invoice Date</span>
              <span class="value">${invoiceDate || new Date().toLocaleDateString('en-IN')}</span>
            </div>
            <div class="card-row">
              <span class="label">Payment Status</span>
              <span class="value">
                <span class="badge ${paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}">${paymentStatus || 'Paid'}</span>
              </span>
            </div>
            <div class="card-row">
              <span class="label">Total Amount</span>
              <span class="value">₹${formattedAmount}</span>
            </div>
          </div>

          <div class="notice">
            📎 <strong>Invoice Attached:</strong> You can view, print, or download the full invoice PDF attached below.
          </div>

          <p class="message" style="margin-bottom: 0;">
            If you have any questions or require custom assistance, feel free to reach out to our team directly.
          </p>
        </div>
        <div class="footer">
          <p><strong>Neela's Sarees</strong> &bull; 123, Silk Street, T. Nagar, Chennai - 600017</p>
          <p>Thank you for letting us be part of your celebrations!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '').trim();
  const pdfBuffer = Buffer.from(cleanBase64, 'base64');

  const mailOptions = {
    from: process.env.SMTP_FROM || `"Neela's Sarees" <${process.env.SMTP_USER}>`,
    to,
    subject: `Invoice #${invoiceNumber} from Neela's Sarees`,
    html: htmlContent,
    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  return await mailer.sendMail(mailOptions);
}

// 1. Create a manual invoice
const createManualInvoice = async (req, res) => {
  await ensureTableExists();
  try {
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerGstin,
      paymentMethod = 'Cash',
      paymentStatus = 'Paid',
      items = [],
      subtotal = 0,
      taxRate = 5,
      taxAmount = 0,
      discountAmount = 0,
      shippingCharge = 0,
      grandTotal = 0,
      notes = '',
      sendEmailNow = false,
      pdfBase64 = null,
    } = req.body;

    if (!invoiceNumber || !customerName) {
      return res.status(400).json({ success: false, message: 'Invoice number and customer name are required' });
    }

    const id = cuid('inv_');
    const itemsJson = typeof items === 'string' ? items : JSON.stringify(items);

    let emailSent = 0;
    let lastEmailSentAt = null;

    // Send email immediately if requested and email provided
    if (sendEmailNow && customerEmail && pdfBase64) {
      try {
        await sendInvoiceEmailHelper({
          to: customerEmail,
          customerName,
          invoiceNumber,
          invoiceDate,
          grandTotal,
          pdfBase64,
          paymentStatus,
        });
        emailSent = 1;
        lastEmailSentAt = new Date();
      } catch (mailErr) {
        console.error('Failed to send invoice email during creation:', mailErr);
        // Continue saving invoice even if email dispatch hit an error
      }
    }

    await pool.query(
      `INSERT INTO manual_invoices 
        (id, invoice_number, invoice_date, due_date, customer_name, customer_email, customer_phone, customer_address, customer_gstin, payment_method, payment_status, items, subtotal, tax_rate, tax_amount, discount_amount, shipping_charge, grand_total, notes, email_sent, last_email_sent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        invoiceNumber.trim(),
        invoiceDate || new Date().toISOString().slice(0, 10),
        dueDate || null,
        customerName.trim(),
        customerEmail ? customerEmail.trim() : null,
        customerPhone ? customerPhone.trim() : null,
        customerAddress || null,
        customerGstin || null,
        paymentMethod,
        paymentStatus,
        itemsJson,
        Number(subtotal) || 0,
        Number(taxRate) || 0,
        Number(taxAmount) || 0,
        Number(discountAmount) || 0,
        Number(shippingCharge) || 0,
        Number(grandTotal) || 0,
        notes || null,
        emailSent,
        lastEmailSentAt,
      ]
    );

    res.status(201).json({
      success: true,
      message: emailSent
        ? `Invoice #${invoiceNumber} saved and emailed to ${customerEmail}`
        : `Invoice #${invoiceNumber} saved successfully`,
      data: { id, invoiceNumber, emailSent },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'An invoice with this invoice number already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error saving invoice', error: serializeError(error) });
  }
};

// 2. Get all manual invoices
const getManualInvoices = async (_req, res) => {
  await ensureTableExists();
  try {
    const [rows] = await pool.query(
      `SELECT * FROM manual_invoices ORDER BY created_at DESC LIMIT 100`
    );

    const formatted = rows.map(row => {
      let parsedItems = [];
      try {
        parsedItems = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
      } catch {
        parsedItems = [];
      }
      return {
        ...row,
        invoiceNumber: row.invoice_number,
        invoiceDate: row.invoice_date,
        dueDate: row.due_date,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone,
        customerAddress: row.customer_address,
        customerGstin: row.customer_gstin,
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        taxRate: Number(row.tax_rate) || 0,
        subtotal: Number(row.subtotal) || 0,
        taxAmount: Number(row.tax_amount) || 0,
        discountAmount: Number(row.discount_amount) || 0,
        shippingCharge: Number(row.shipping_charge) || 0,
        grandTotal: Number(row.grand_total) || 0,
        emailSent: Boolean(row.email_sent),
        lastEmailSentAt: row.last_email_sent_at,
        createdAt: row.created_at,
        items: parsedItems,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching manual invoices', error: serializeError(error) });
  }
};

// 3. Get single manual invoice
const getManualInvoiceById = async (req, res) => {
  await ensureTableExists();
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM manual_invoices WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const row = rows[0];
    let parsedItems = [];
    try {
      parsedItems = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
    } catch {
      parsedItems = [];
    }

    res.json({
      success: true,
      data: {
        ...row,
        invoiceNumber: row.invoice_number,
        invoiceDate: row.invoice_date,
        dueDate: row.due_date,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone,
        customerAddress: row.customer_address,
        customerGstin: row.customer_gstin,
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        taxRate: Number(row.tax_rate) || 0,
        subtotal: Number(row.subtotal) || 0,
        taxAmount: Number(row.tax_amount) || 0,
        discountAmount: Number(row.discount_amount) || 0,
        shippingCharge: Number(row.shipping_charge) || 0,
        grandTotal: Number(row.grand_total) || 0,
        emailSent: Boolean(row.email_sent),
        lastEmailSentAt: row.last_email_sent_at,
        createdAt: row.created_at,
        items: parsedItems,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// 4. Send or Re-send invoice email
const sendManualInvoiceEmail = async (req, res) => {
  await ensureTableExists();
  try {
    const {
      invoiceId,
      customerEmail,
      customerName,
      invoiceNumber,
      invoiceDate,
      grandTotal,
      pdfBase64,
      paymentStatus = 'Paid',
    } = req.body;

    if (!customerEmail) {
      return res.status(400).json({ success: false, message: 'Customer email address is required' });
    }

    if (!pdfBase64) {
      return res.status(400).json({ success: false, message: 'Invoice PDF content is required' });
    }

    await sendInvoiceEmailHelper({
      to: customerEmail.trim(),
      customerName,
      invoiceNumber,
      invoiceDate,
      grandTotal,
      pdfBase64,
      paymentStatus,
    });

    // If linked to an existing invoice record in DB, update email status
    if (invoiceId) {
      try {
        await pool.query(
          'UPDATE manual_invoices SET email_sent = 1, last_email_sent_at = NOW() WHERE id = ?',
          [invoiceId]
        );
      } catch (dbErr) {
        console.warn('Could not update invoice record email status:', dbErr.message);
      }
    }

    res.json({
      success: true,
      message: `Invoice #${invoiceNumber} successfully emailed to ${customerEmail}`,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch email. Please check your SMTP settings.',
      error: serializeError(error),
    });
  }
};

// 5. Delete manual invoice
const deleteManualInvoice = async (req, res) => {
  await ensureTableExists();
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM manual_invoices WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting invoice', error: serializeError(error) });
  }
};

module.exports = {
  createManualInvoice,
  getManualInvoices,
  getManualInvoiceById,
  sendManualInvoiceEmail,
  deleteManualInvoice,
};
