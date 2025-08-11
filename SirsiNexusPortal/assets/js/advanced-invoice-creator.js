/**
 * Advanced Invoice Creator with Multi-Channel Distribution
 * Integrated with SirsiMultiChannel distribution system
 * @author SirsiNexus Development Team
 * @version 2.0.0
 */

class AdvancedInvoiceCreator {
    constructor() {
        this.currentInvoice = null;
        this.distribution = null;
        this.qrCodeInstance = null;
        this.init();
    }

    init() {
        this.setDefaultValues();
        this.bindEvents();
        this.initializeMultiChannelDistribution();
    }

    setDefaultValues() {
        // Set default due date to 30 days from now
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
        document.getElementById('due-date').value = defaultDueDate.toISOString().split('T')[0];
        
        // Auto-generate invoice number with Sirsi prefix
        const year = new Date().getFullYear();
        const timestamp = String(Date.now()).slice(-4);
        const invoiceNumber = `SIRSI-${year}-${timestamp}`;
        document.getElementById('invoice-number').value = invoiceNumber;
    }

    initializeMultiChannelDistribution() {
        // Initialize the multi-channel distribution system
        if (window.SirsiMultiChannel) {
            this.distribution = window.SirsiMultiChannel;
            console.log('✅ Multi-channel distribution system initialized');
        } else {
            console.warn('⚠️ Multi-channel distribution system not found');
            // Fallback initialization
            this.loadMultiChannelFallback();
        }
    }

    loadMultiChannelFallback() {
        // Basic fallback if the multi-channel system isn't loaded
        const script = document.createElement('script');
        script.src = './assets/js/multi-channel-distribution.js';
        script.onload = () => {
            this.distribution = window.SirsiMultiChannel;
            console.log('✅ Multi-channel distribution loaded via fallback');
        };
        document.head.appendChild(script);
    }

    bindEvents() {
        // Form validation with real-time feedback
        this.bindFormValidation();
        
        // Channel checkbox handlers
        this.bindChannelToggles();
        
        // Auto-formatting handlers
        this.bindAutoFormatting();
    }

    bindFormValidation() {
        const form = document.getElementById('advanced-invoice-form');
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    bindChannelToggles() {
        const emailToggle = document.getElementById('enable-email');
        const smsToggle = document.getElementById('enable-sms');
        const socialToggle = document.getElementById('enable-social');
        const qrToggle = document.getElementById('enable-qr');
        
        smsToggle.addEventListener('change', (e) => {
            const phoneField = document.getElementById('client-phone');
            if (e.target.checked) {
                phoneField.setAttribute('required', '');
                phoneField.parentElement.querySelector('label').innerHTML += ' <span class="text-red-500">*</span>';
            } else {
                phoneField.removeAttribute('required');
                const label = phoneField.parentElement.querySelector('label');
                label.innerHTML = label.innerHTML.replace(' <span class="text-red-500">*</span>', '');
            }
        });
    }

    bindAutoFormatting() {
        // Phone number formatting
        const phoneField = document.getElementById('client-phone');
        phoneField.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{3})/, '($1) $2');
            }
            e.target.value = value;
        });

        // Amount formatting
        const amountField = document.getElementById('invoice-amount');
        amountField.addEventListener('blur', (e) => {
            if (e.target.value) {
                const value = parseFloat(e.target.value);
                e.target.value = value.toFixed(2);
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        } else if (field.type === 'number' && value) {
            const num = parseFloat(value);
            const min = parseFloat(field.min) || 0;
            const max = parseFloat(field.max) || Infinity;
            if (num < min || num > max) {
                isValid = false;
                errorMessage = `Amount must be between $${min} and $${max.toLocaleString()}`;
            }
        } else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
        field.classList.remove('border-slate-300', 'focus:border-blue-500', 'focus:ring-blue-500');
        
        // Add error message
        let errorDiv = field.parentElement.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message text-sm text-red-600 dark:text-red-400 mt-1';
            field.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
        field.classList.add('border-slate-300', 'focus:border-blue-500', 'focus:ring-blue-500');
        
        const errorDiv = field.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10;
    }

    async generateAdvancedInvoice() {
        // Validate all form fields
        const form = document.getElementById('advanced-invoice-form');
        const requiredFields = form.querySelectorAll('[required]');
        let allValid = true;

        for (const field of requiredFields) {
            if (!this.validateField(field)) {
                allValid = false;
            }
        }

        if (!allValid) {
            this.showNotification('Please correct the errors in the form before proceeding.', 'error');
            return;
        }

        // Create invoice object
        this.currentInvoice = this.createInvoiceObject();
        
        // Generate payment link
        const paymentLink = this.generatePaymentLink(this.currentInvoice);
        
        // Get selected distribution channels
        const channels = this.getSelectedChannels();
        
        if (channels.length === 0) {
            this.showNotification('Please select at least one distribution channel.', 'warning');
            return;
        }

        // Show loading state
        this.showLoadingState();

        try {
            // Distribute via selected channels
            await this.distributeInvoice(this.currentInvoice, paymentLink, channels);
            
            // Store invoice for records
            this.storeInvoiceRecord();
            
            // Show success results
            this.showDistributionResults(channels);
            
        } catch (error) {
            console.error('Distribution error:', error);
            this.showNotification('Error distributing invoice. Please try again.', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    createInvoiceObject() {
        return {
            number: document.getElementById('invoice-number').value.trim(),
            amount: parseFloat(document.getElementById('invoice-amount').value),
            client: document.getElementById('client-name').value.trim(),
            email: document.getElementById('client-email').value.trim(),
            phone: document.getElementById('client-phone').value.trim(),
            service: document.getElementById('service-description').value.trim(),
            dueDate: document.getElementById('due-date').value,
            createdAt: new Date().toISOString(),
            invoiceId: this.generateInvoiceId(),
            clientId: this.generateClientId(),
            status: 'draft'
        };
    }

    generateInvoiceId() {
        return 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateClientId() {
        const email = document.getElementById('client-email').value;
        return 'client_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substr(0, 12);
    }

    generatePaymentLink(invoice) {
        const baseUrl = window.location.origin + window.location.pathname.replace('create-invoice.html', 'pay.html');
        const invoiceData = encodeURIComponent(JSON.stringify(invoice));
        return `${baseUrl}?invoice=${invoiceData}`;
    }

    getSelectedChannels() {
        const channels = [];
        
        if (document.getElementById('enable-email').checked) {
            channels.push('email');
        }
        if (document.getElementById('enable-sms').checked) {
            channels.push('sms');
        }
        if (document.getElementById('enable-social').checked) {
            channels.push('social');
        }
        if (document.getElementById('enable-qr').checked) {
            channels.push('qr');
        }
        
        return channels;
    }

    async distributeInvoice(invoice, paymentLink, channels) {
        const distributionResults = [];

        for (const channel of channels) {
            try {
                let result;
                switch (channel) {
                    case 'email':
                        result = await this.distributeViaEmail(invoice, paymentLink);
                        break;
                    case 'sms':
                        result = await this.distributeViaSMS(invoice, paymentLink);
                        break;
                    case 'social':
                        result = await this.distributeViaSocial(invoice, paymentLink);
                        break;
                    case 'qr':
                        result = await this.generateQRCode(paymentLink);
                        break;
                }
                distributionResults.push({ channel, success: true, result });
            } catch (error) {
                console.error(`${channel} distribution failed:`, error);
                distributionResults.push({ channel, success: false, error: error.message });
            }
        }

        return distributionResults;
    }

    async distributeViaEmail(invoice, paymentLink) {
        if (!this.distribution) {
            // Fallback to mailto
            return this.fallbackEmailDistribution(invoice, paymentLink);
        }

        // Generate QR code for email inclusion
        const qrCodeDataUrl = await this.generateQRCodeDataUrl(paymentLink);
        
        // Use the multi-channel distribution system
        return await this.distribution.sendInvoiceEmail(invoice, paymentLink, {
            includeQR: true,
            qrCodeData: qrCodeDataUrl,
            templateStyle: 'professional'
        });
    }

    async distributeViaSMS(invoice, paymentLink) {
        if (!this.distribution) {
            throw new Error('SMS distribution requires multi-channel system');
        }

        return await this.distribution.sendInvoiceSMS(invoice, paymentLink, {
            includeQR: true,
            shortUrl: true
        });
    }

    async distributeViaSocial(invoice, paymentLink) {
        if (!this.distribution) {
            // Fallback to manual social sharing
            return this.fallbackSocialDistribution(invoice, paymentLink);
        }

        return await this.distribution.generateSocialShares(invoice, paymentLink, {
            platforms: ['whatsapp', 'twitter', 'linkedin', 'facebook'],
            customMessage: `Invoice ${invoice.number} from SirsiNexus - Secure payment required`
        });
    }

    async generateQRCode(paymentLink) {
        if (!this.qrCodeInstance) {
            this.qrCodeInstance = {};
        }

        return new Promise((resolve, reject) => {
            const qrContainer = document.createElement('canvas');
            qrContainer.width = 300;
            qrContainer.height = 300;

            QRCode.toCanvas(qrContainer, paymentLink, {
                width: 300,
                height: 300,
                colorDark: '#1e293b',
                colorLight: '#ffffff',
                margin: 2,
                errorCorrectionLevel: 'M'
            }, (error) => {
                if (error) {
                    reject(error);
                } else {
                    this.qrCodeInstance.canvas = qrContainer;
                    this.qrCodeInstance.dataUrl = qrContainer.toDataURL('image/png');
                    resolve({
                        canvas: qrContainer,
                        dataUrl: this.qrCodeInstance.dataUrl,
                        downloadable: true
                    });
                }
            });
        });
    }

    async generateQRCodeDataUrl(url) {
        const canvas = document.createElement('canvas');
        return new Promise((resolve) => {
            QRCode.toCanvas(canvas, url, {
                width: 200,
                height: 200,
                colorDark: '#1e293b',
                colorLight: '#ffffff'
            }, () => {
                resolve(canvas.toDataURL('image/png'));
            });
        });
    }

    fallbackEmailDistribution(invoice, paymentLink) {
        const subject = `Invoice ${invoice.number} - SirsiNexus Professional Services`;
        const body = this.generateEmailBody(invoice, paymentLink);
        const mailtoLink = `mailto:${invoice.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.open(mailtoLink, '_blank');
        
        return {
            method: 'mailto',
            recipient: invoice.email,
            subject: subject,
            status: 'opened'
        };
    }

    generateEmailBody(invoice, paymentLink) {
        return `Dear ${invoice.client},

Thank you for choosing SirsiNexus for your AI infrastructure needs.

INVOICE DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Invoice #: ${invoice.number}
Service: ${invoice.service}
Amount: $${invoice.amount.toFixed(2)} USD
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

SECURE PAYMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please pay securely using the link below:
${paymentLink}

We accept all major payment methods including:
• Credit/Debit Cards • PayPal • Apple Pay • Google Pay
• Bank Transfers • Venmo • Buy Now Pay Later options

QUESTIONS & SUPPORT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For any questions about this invoice, please contact:
Email: support@sirsinexus.com
Phone: +1 (555) 123-SIRSI

Thank you for your business!

Best regards,
SirsiNexus Team
Leading AI Infrastructure Solutions
https://sirsinexus.com

---
This is an automated invoice. Please do not reply to this email.`;
    }

    fallbackSocialDistribution(invoice, paymentLink) {
        const message = `Invoice ${invoice.number} from SirsiNexus - Secure payment required: ${paymentLink}`;
        const platforms = [
            { name: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(message)}` },
            { name: 'Twitter', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}` },
            { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(paymentLink)}` }
        ];

        return {
            platforms: platforms,
            message: message,
            status: 'links_generated'
        };
    }

    storeInvoiceRecord() {
        const record = {
            ...this.currentInvoice,
            type: 'sirsi-professional-invoice',
            status: 'sent',
            distributionChannels: this.getSelectedChannels(),
            paymentLink: this.generatePaymentLink(this.currentInvoice),
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(`invoice-${this.currentInvoice.number}`, JSON.stringify(record));
    }

    showDistributionResults(channels) {
        const resultsContainer = document.getElementById('distribution-results');
        resultsContainer.innerHTML = '';

        const successCard = document.createElement('div');
        successCard.className = 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4';
        successCard.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <div>
                    <h4 class="font-semibold text-green-900 dark:text-green-100">Invoice Created Successfully!</h4>
                    <p class="text-sm text-green-800 dark:text-green-200">Invoice #${this.currentInvoice.number}</p>
                </div>
            </div>
        `;
        resultsContainer.appendChild(successCard);

        // Channel results
        channels.forEach(channel => {
            const channelCard = this.createChannelResultCard(channel);
            resultsContainer.appendChild(channelCard);
        });

        // Action buttons
        const actionsCard = document.createElement('div');
        actionsCard.className = 'border-t pt-4 mt-4';
        actionsCard.innerHTML = `
            <div class="space-y-3">
                <button onclick="advancedInvoiceCreator.previewInvoice()" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Preview Invoice
                </button>
                <button onclick="advancedInvoiceCreator.downloadQRCode()" 
                        class="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                    Download QR Code
                </button>
                <button onclick="advancedInvoiceCreator.resetForm()" 
                        class="w-full bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors">
                    Create New Invoice
                </button>
            </div>
        `;
        resultsContainer.appendChild(actionsCard);
    }

    createChannelResultCard(channel) {
        const channelInfo = {
            email: { icon: '📧', name: 'Email', color: 'blue' },
            sms: { icon: '📱', name: 'SMS', color: 'green' },
            social: { icon: '🌐', name: 'Social Media', color: 'purple' },
            qr: { icon: '📱', name: 'QR Code', color: 'orange' }
        };

        const info = channelInfo[channel];
        const card = document.createElement('div');
        card.className = `bg-${info.color}-50 dark:bg-${info.color}-900/20 border border-${info.color}-200 dark:border-${info.color}-800 rounded-lg p-3 mb-2`;
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-lg">${info.icon}</span>
                    <span class="font-medium text-${info.color}-900 dark:text-${info.color}-100">${info.name}</span>
                </div>
                <div class="text-xs text-${info.color}-700 dark:text-${info.color}-300">
                    ✓ Distributed
                </div>
            </div>
        `;
        return card;
    }

    previewInvoice() {
        if (!this.currentInvoice) {
            this.showNotification('No invoice to preview. Please create an invoice first.', 'warning');
            return;
        }
        
        const invoiceData = encodeURIComponent(JSON.stringify(this.currentInvoice));
        const previewUrl = `pay.html?invoice=${invoiceData}`;
        window.open(previewUrl, '_blank');
    }

    downloadQRCode() {
        if (!this.qrCodeInstance?.dataUrl) {
            this.showNotification('No QR code available. Please generate an invoice with QR code enabled.', 'warning');
            return;
        }

        const link = document.createElement('a');
        link.download = `invoice-${this.currentInvoice.number}-qr.png`;
        link.href = this.qrCodeInstance.dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    resetForm() {
        document.getElementById('advanced-invoice-form').reset();
        this.currentInvoice = null;
        this.qrCodeInstance = null;
        
        // Reset results panel
        const resultsContainer = document.getElementById('distribution-results');
        resultsContainer.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <p class="text-slate-500 dark:text-slate-400">Create an invoice to see distribution options</p>
            </div>
        `;
        
        // Reset default values
        this.setDefaultValues();
    }

    showLoadingState() {
        const button = document.querySelector('[onclick="generateAdvancedInvoice()"]');
        button.disabled = true;
        button.innerHTML = `
            <svg class="animate-spin w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75"></path>
            </svg>
            Creating & Distributing...
        `;
    }

    hideLoadingState() {
        const button = document.querySelector('[onclick="generateAdvancedInvoice()"]');
        button.disabled = false;
        button.innerHTML = `
            <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Create & Distribute Invoice
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-100 border-green-400 text-green-700',
            error: 'bg-red-100 border-red-400 text-red-700',
            warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
            info: 'bg-blue-100 border-blue-400 text-blue-700'
        };

        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg border ${colors[type]} shadow-lg max-w-md`;
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg leading-none">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Global functions for onclick handlers
let advancedInvoiceCreator;

function generateAdvancedInvoice() {
    advancedInvoiceCreator.generateAdvancedInvoice();
}

function previewInvoice() {
    advancedInvoiceCreator.previewInvoice();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    advancedInvoiceCreator = new AdvancedInvoiceCreator();
    console.log('🚀 Advanced Invoice Creator initialized');
});
