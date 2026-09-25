/**
 * NSGP OCR Service
 * Document text extraction and field mapping
 * Uses pattern matching for demo; architecture supports Tesseract.js or external OCR API
 */
const OCRService = (() => {
    // Demo extracted data templates for different document types
    const DEMO_OCR_DATA = {
        aadhaar: {
            type: 'Aadhaar Card',
            fields: {
                name: { value: 'Ashish Kumar Singh', confidence: 'high' },
                dob: { value: '2005-05-10', confidence: 'high' },
                gender: { value: 'Male', confidence: 'high' },
                address: { value: '123, Ram Nagar, Sector 5, Lucknow', confidence: 'medium' },
                pin: { value: '226001', confidence: 'high' },
                aadhaar: { value: 'XXXX XXXX 1234', confidence: 'high' }
            }
        },
        pan: {
            type: 'PAN Card',
            fields: {
                name: { value: 'Ashish Kumar Singh', confidence: 'high' },
                fatherName: { value: 'Rajesh Kumar Singh', confidence: 'high' },
                dob: { value: '2005-05-10', confidence: 'high' },
            }
        },
        drivingLicence: {
            type: 'Driving Licence',
            fields: {
                name: { value: 'Ashish Kumar Singh', confidence: 'high' },
                fatherName: { value: 'Rajesh Kumar Singh', confidence: 'medium' },
                dob: { value: '2005-05-10', confidence: 'high' },
                address: { value: '123, Ram Nagar, Sector 5, Lucknow', confidence: 'medium' },
            }
        },
        voterID: {
            type: 'Voter ID',
            fields: {
                name: { value: 'Ashish Kumar Singh', confidence: 'high' },
                fatherName: { value: 'Rajesh Kumar Singh', confidence: 'high' },
                dob: { value: '2005-05-10', confidence: 'medium' },
                address: { value: '123, Ram Nagar, Sector 5, Lucknow', confidence: 'medium' },
            }
        },
        incomeCert: {
            type: 'Income Certificate',
            fields: {
                name: { value: 'Ashish Kumar Singh', confidence: 'high' },
                fatherName: { value: 'Rajesh Kumar Singh', confidence: 'high' },
                annualIncome: { value: '250000', confidence: 'medium' },
            }
        },
        addressProof: {
            type: 'Address Proof',
            fields: {
                name: { value: 'Ashish Kumar Singh', confidence: 'high' },
                address: { value: '123, Ram Nagar, Sector 5, Lucknow', confidence: 'high' },
                pin: { value: '226001', confidence: 'high' },
                state: { value: 'Uttar Pradesh', confidence: 'high' },
                district: { value: 'Lucknow', confidence: 'high' },
            }
        },
        unknown: {
            type: null,
            fields: {
                name: { value: 'Ashish Kumar Singh', confidence: 'medium' },
            }
        }
    };

    /**
     * Process a document image (demo implementation)
     * In production, this would call Tesseract.js or a cloud OCR API
     */
    async function processDocument(imageData) {
        // Simulate processing delay
        await delay(2000);

        // For demo: detect document type based on image analysis
        // In production, this would use actual OCR + classification
        const docType = detectDocumentType(imageData);

        const ocrResult = DEMO_OCR_DATA[docType] || DEMO_OCR_DATA.unknown;

        return {
            success: true,
            documentType: ocrResult.type,
            documentTypeKey: docType,
            fields: ocrResult.fields,
            rawText: generateDemoRawText(ocrResult),
            processedAt: new Date().toISOString()
        };
    }

    /**
     * Detect document type from image (demo)
     * In production: Use ML classification or pattern matching on OCR text
     */
    function detectDocumentType(imageData) {
        // For demo, cycle through document types or use random selection
        // In a real implementation, this would analyze the image content
        const types = ['aadhaar', 'pan', 'addressProof', 'voterID'];
        // Default to aadhaar for demo
        return 'aadhaar';
    }

    /**
     * Map OCR results to form fields
     */
    function mapToFormFields(ocrFields, formFieldDefinitions) {
        const mapping = {};
        
        for (const [ocrKey, ocrData] of Object.entries(ocrFields)) {
            // Find matching form field
            const formField = formFieldDefinitions.find(f => f.id === ocrKey);
            if (formField) {
                mapping[ocrKey] = {
                    fieldId: ocrKey,
                    value: ocrData.value,
                    confidence: ocrData.confidence,
                    formLabel: formField.label
                };
            }
        }

        return mapping;
    }

    /**
     * Generate demo raw text for display purposes
     */
    function generateDemoRawText(ocrResult) {
        let text = '';
        if (ocrResult.type) {
            text += `GOVERNMENT OF INDIA\n${ocrResult.type.toUpperCase()}\n\n`;
        }
        for (const [key, data] of Object.entries(ocrResult.fields)) {
            text += `${key}: ${data.value}\n`;
        }
        return text;
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Set the document type for demo purposes
     */
    function setDemoDocType(type) {
        // This allows the demo to simulate scanning different document types
        if (DEMO_OCR_DATA[type]) {
            return DEMO_OCR_DATA[type];
        }
        return DEMO_OCR_DATA.aadhaar;
    }

    return { processDocument, mapToFormFields, detectDocumentType, setDemoDocType };
})();
