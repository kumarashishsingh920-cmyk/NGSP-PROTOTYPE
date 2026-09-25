/**
 * NSGP Form Definitions
 * Complete service form definitions with fields, sections, and validation rules
 */
const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Andaman & Nicobar', 'Chandigarh', 'Dadra & Nagar Haveli',
    'Daman & Diu', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const FORM_DEFINITIONS = {
    'income-certificate': {
        id: 'income-certificate',
        title: 'Income Certificate Application',
        titleKey: 'services.income.title',
        category: 'certificates',
        sections: [
            {
                id: 'personal',
                title: 'Personal Details',
                fields: [
                    { id: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name', audioKey: 'audio.fullName', helpText: 'Enter your name exactly as it appears on your official documents.' },
                    { id: 'dob', label: 'Date of Birth', type: 'date', required: true, audioKey: 'audio.dob', helpText: 'Enter your date of birth.' },
                    { id: 'age', label: 'Age (Years)', type: 'number', validationType: 'age', required: true, placeholder: 'Enter your age', audioKey: 'audio.age', helpText: 'Your current age in years.' },
                    { id: 'gender', label: 'Gender', type: 'select', required: true, options: ['', 'Male', 'Female', 'Other'], audioKey: 'audio.gender' },
                    { id: 'fatherName', label: "Father's/Mother's Name", type: 'text', required: true, placeholder: "Enter father's or mother's name", audioKey: 'audio.fatherName', helpText: "As shown on your official documents." },
                ]
            },
            {
                id: 'contact',
                title: 'Contact Details',
                fields: [
                    { id: 'mobile', label: 'Mobile Number', type: 'tel', validationType: 'phone', required: true, placeholder: '10-digit mobile number', audioKey: 'audio.mobile', helpText: 'Your active 10-digit mobile number.' },
                    { id: 'email', label: 'Email Address', type: 'email', validationType: 'email', required: false, placeholder: 'your.email@example.com', audioKey: 'audio.email', helpText: 'Your email address for communication.' },
                ]
            },
            {
                id: 'address',
                title: 'Address Details',
                fields: [
                    { id: 'address', label: 'Complete Address', type: 'textarea', required: true, placeholder: 'Enter your complete residential address', audioKey: 'audio.address', helpText: 'Your full residential address including house number, street, locality.' },
                    { id: 'state', label: 'State/UT', type: 'select', required: true, options: ['', ...INDIAN_STATES], audioKey: 'audio.state' },
                    { id: 'district', label: 'District', type: 'text', required: true, placeholder: 'Enter your district', audioKey: 'audio.district' },
                    { id: 'pin', label: 'PIN Code', type: 'text', validationType: 'pin', required: true, placeholder: '6-digit PIN code', audioKey: 'audio.pin', helpText: 'Your 6-digit postal PIN code.' },
                ]
            },
            {
                id: 'income',
                title: 'Income Details',
                fields: [
                    { id: 'annualIncome', label: 'Annual Income (₹)', type: 'number', required: true, placeholder: 'Enter annual income in Rupees', audioKey: 'audio.income', helpText: 'Your total annual income from all sources in Indian Rupees.' },
                    { id: 'incomeSource', label: 'Primary Source of Income', type: 'select', required: true, options: ['', 'Agriculture', 'Business', 'Government Employment', 'Private Employment', 'Self-Employed', 'Pension', 'Other'], audioKey: 'audio.incomeSource' },
                    { id: 'occupation', label: 'Occupation', type: 'text', required: false, placeholder: 'Enter your occupation', audioKey: 'audio.occupation' },
                ]
            },
            {
                id: 'documents',
                title: 'Supporting Documents',
                fields: [
                    { id: 'idProof', label: 'Identity Proof', type: 'file', required: true, accept: 'image/*,.pdf', helpText: 'Aadhaar, PAN, Voter ID, or Passport.' },
                    { id: 'addressProof', label: 'Address Proof', type: 'file', required: false, accept: 'image/*,.pdf', helpText: 'Utility bill, bank statement, or ration card.' },
                    { id: 'incomeProof', label: 'Income Proof', type: 'file', required: false, accept: 'image/*,.pdf', helpText: 'Salary slip, IT return, or any income proof.' },
                ]
            },
            {
                id: 'review',
                title: 'Review & Submit',
                isReviewStep: true,
                fields: []
            }
        ],
        readinessWeights: { required: 25, format: 20, crossField: 20, documents: 20, supporting: 15 }
    },

    'residence-certificate': {
        id: 'residence-certificate',
        title: 'Residence/Domicile Certificate Application',
        titleKey: 'services.residence.title',
        category: 'certificates',
        sections: [
            {
                id: 'personal',
                title: 'Personal Details',
                fields: [
                    { id: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name', audioKey: 'audio.fullName' },
                    { id: 'dob', label: 'Date of Birth', type: 'date', required: true, audioKey: 'audio.dob' },
                    { id: 'age', label: 'Age (Years)', type: 'number', validationType: 'age', required: true, placeholder: 'Enter your age', audioKey: 'audio.age' },
                    { id: 'fatherName', label: "Father's/Mother's Name", type: 'text', required: true, placeholder: "Enter father's or mother's name", audioKey: 'audio.fatherName' },
                ]
            },
            {
                id: 'contact',
                title: 'Contact Details',
                fields: [
                    { id: 'mobile', label: 'Mobile Number', type: 'tel', validationType: 'phone', required: true, placeholder: '10-digit mobile number', audioKey: 'audio.mobile' },
                    { id: 'email', label: 'Email Address', type: 'email', validationType: 'email', required: false, placeholder: 'your.email@example.com', audioKey: 'audio.email' },
                ]
            },
            {
                id: 'address',
                title: 'Address Details',
                fields: [
                    { id: 'address', label: 'Complete Address', type: 'textarea', required: true, placeholder: 'Enter your complete residential address', audioKey: 'audio.address' },
                    { id: 'state', label: 'State/UT', type: 'select', required: true, options: ['', ...INDIAN_STATES], audioKey: 'audio.state' },
                    { id: 'district', label: 'District', type: 'text', required: true, placeholder: 'Enter your district', audioKey: 'audio.district' },
                    { id: 'pin', label: 'PIN Code', type: 'text', validationType: 'pin', required: true, placeholder: '6-digit PIN code', audioKey: 'audio.pin' },
                ]
            },
            {
                id: 'residence',
                title: 'Residence Details',
                fields: [
                    { id: 'duration', label: 'Duration of Residence (Years)', type: 'number', required: true, placeholder: 'How many years at current address', audioKey: 'audio.duration', helpText: 'Number of years you have been living at your current address.' },
                    { id: 'previousAddress', label: 'Previous Address (if any)', type: 'textarea', required: false, placeholder: 'Enter previous address if changed in last 5 years' },
                ]
            },
            {
                id: 'documents',
                title: 'Supporting Documents',
                fields: [
                    { id: 'idProof', label: 'Identity Proof', type: 'file', required: true, accept: 'image/*,.pdf' },
                    { id: 'addressProof', label: 'Address Proof', type: 'file', required: false, accept: 'image/*,.pdf' },
                    { id: 'residenceProof', label: 'Residence Proof', type: 'file', required: false, accept: 'image/*,.pdf', helpText: 'Electricity bill, rent agreement, or property tax receipt.' },
                ]
            },
            {
                id: 'review',
                title: 'Review & Submit',
                isReviewStep: true,
                fields: []
            }
        ],
        readinessWeights: { required: 25, format: 20, crossField: 20, documents: 20, supporting: 15 }
    },

    'aadhaar-update': {
        id: 'aadhaar-update',
        title: 'Aadhaar-Related Services (Demo)',
        titleKey: 'services.aadhaar.title',
        category: 'identity',
        sections: [
            {
                id: 'personal',
                title: 'Personal Details',
                fields: [
                    { id: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name', audioKey: 'audio.fullName' },
                    { id: 'dob', label: 'Date of Birth', type: 'date', required: true, audioKey: 'audio.dob' },
                    { id: 'age', label: 'Age (Years)', type: 'number', validationType: 'age', required: true, placeholder: 'Enter your age', audioKey: 'audio.age' },
                    { id: 'gender', label: 'Gender', type: 'select', required: true, options: ['', 'Male', 'Female', 'Other'], audioKey: 'audio.gender' },
                    { id: 'aadhaar', label: 'Aadhaar Number', type: 'text', validationType: 'aadhaar', required: true, placeholder: 'XXXX XXXX XXXX', audioKey: 'audio.aadhaar', helpText: 'Your 12-digit Aadhaar number. For demonstration purposes only.' },
                ]
            },
            {
                id: 'contact',
                title: 'Contact Details',
                fields: [
                    { id: 'mobile', label: 'Mobile Number', type: 'tel', validationType: 'phone', required: true, placeholder: '10-digit mobile number', audioKey: 'audio.mobile' },
                    { id: 'email', label: 'Email Address', type: 'email', validationType: 'email', required: false, placeholder: 'your.email@example.com', audioKey: 'audio.email' },
                ]
            },
            {
                id: 'address',
                title: 'Address Details',
                fields: [
                    { id: 'address', label: 'Complete Address', type: 'textarea', required: true, placeholder: 'Enter your complete residential address', audioKey: 'audio.address' },
                    { id: 'state', label: 'State/UT', type: 'select', required: true, options: ['', ...INDIAN_STATES], audioKey: 'audio.state' },
                    { id: 'district', label: 'District', type: 'text', required: true, placeholder: 'Enter your district', audioKey: 'audio.district' },
                    { id: 'pin', label: 'PIN Code', type: 'text', validationType: 'pin', required: true, placeholder: '6-digit PIN code', audioKey: 'audio.pin' },
                ]
            },
            {
                id: 'documents',
                title: 'Supporting Documents',
                fields: [
                    { id: 'idProof', label: 'Identity Proof', type: 'file', required: true, accept: 'image/*,.pdf' },
                    { id: 'addressProof', label: 'Address Proof', type: 'file', required: false, accept: 'image/*,.pdf' },
                ]
            },
            {
                id: 'review',
                title: 'Review & Submit',
                isReviewStep: true,
                fields: []
            }
        ],
        readinessWeights: { required: 25, format: 20, crossField: 20, documents: 20, supporting: 15 }
    },

    // Generic form definition factory for services that share similar structures
    'caste-certificate': {
        id: 'caste-certificate',
        title: 'Caste Certificate Application',
        category: 'certificates',
        sections: [
            { id: 'personal', title: 'Personal Details', fields: [
                { id: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name', audioKey: 'audio.fullName' },
                { id: 'dob', label: 'Date of Birth', type: 'date', required: true, audioKey: 'audio.dob' },
                { id: 'age', label: 'Age (Years)', type: 'number', validationType: 'age', required: true, placeholder: 'Enter your age', audioKey: 'audio.age' },
                { id: 'fatherName', label: "Father's/Mother's Name", type: 'text', required: true, placeholder: "Enter father's or mother's name", audioKey: 'audio.fatherName' },
                { id: 'gender', label: 'Gender', type: 'select', required: true, options: ['', 'Male', 'Female', 'Other'], audioKey: 'audio.gender' },
            ]},
            { id: 'contact', title: 'Contact Details', fields: [
                { id: 'mobile', label: 'Mobile Number', type: 'tel', validationType: 'phone', required: true, placeholder: '10-digit mobile number', audioKey: 'audio.mobile' },
                { id: 'email', label: 'Email Address', type: 'email', validationType: 'email', required: false, placeholder: 'your.email@example.com', audioKey: 'audio.email' },
            ]},
            { id: 'address', title: 'Address Details', fields: [
                { id: 'address', label: 'Complete Address', type: 'textarea', required: true, placeholder: 'Enter your complete residential address', audioKey: 'audio.address' },
                { id: 'state', label: 'State/UT', type: 'select', required: true, options: ['', ...INDIAN_STATES], audioKey: 'audio.state' },
                { id: 'district', label: 'District', type: 'text', required: true, placeholder: 'Enter your district', audioKey: 'audio.district' },
                { id: 'pin', label: 'PIN Code', type: 'text', validationType: 'pin', required: true, placeholder: '6-digit PIN code', audioKey: 'audio.pin' },
            ]},
            { id: 'caste', title: 'Caste Details', fields: [
                { id: 'casteName', label: 'Caste Name', type: 'text', required: true, placeholder: 'Enter caste name' },
                { id: 'casteCategory', label: 'Category', type: 'select', required: true, options: ['', 'SC', 'ST', 'OBC', 'General'] },
            ]},
            { id: 'documents', title: 'Supporting Documents', fields: [
                { id: 'idProof', label: 'Identity Proof', type: 'file', required: true, accept: 'image/*,.pdf' },
                { id: 'casteProof', label: 'Caste Proof', type: 'file', required: false, accept: 'image/*,.pdf' },
            ]},
            { id: 'review', title: 'Review & Submit', isReviewStep: true, fields: [] }
        ],
        readinessWeights: { required: 25, format: 20, crossField: 20, documents: 20, supporting: 15 }
    },

    'birth-certificate': {
        id: 'birth-certificate',
        title: 'Birth Certificate Application',
        category: 'certificates',
        sections: [
            { id: 'child', title: 'Child Details', fields: [
                { id: 'fullName', label: 'Full Name of Child', type: 'text', required: true, placeholder: 'Enter child\'s full name', audioKey: 'audio.fullName' },
                { id: 'dob', label: 'Date of Birth', type: 'date', required: true, audioKey: 'audio.dob' },
                { id: 'gender', label: 'Gender', type: 'select', required: true, options: ['', 'Male', 'Female', 'Other'], audioKey: 'audio.gender' },
            ]},
            { id: 'parents', title: 'Parent Details', fields: [
                { id: 'fatherName', label: "Father's Name", type: 'text', required: true, placeholder: "Enter father's name", audioKey: 'audio.fatherName' },
                { id: 'motherName', label: "Mother's Name", type: 'text', required: true, placeholder: "Enter mother's name" },
                { id: 'mobile', label: 'Mobile Number', type: 'tel', validationType: 'phone', required: true, placeholder: '10-digit mobile number', audioKey: 'audio.mobile' },
            ]},
            { id: 'address', title: 'Address Details', fields: [
                { id: 'address', label: 'Address', type: 'textarea', required: true, placeholder: 'Enter address', audioKey: 'audio.address' },
                { id: 'state', label: 'State/UT', type: 'select', required: true, options: ['', ...INDIAN_STATES], audioKey: 'audio.state' },
                { id: 'pin', label: 'PIN Code', type: 'text', validationType: 'pin', required: true, placeholder: '6-digit PIN code', audioKey: 'audio.pin' },
            ]},
            { id: 'documents', title: 'Supporting Documents', fields: [
                { id: 'hospitalProof', label: 'Hospital/Birth Proof', type: 'file', required: true, accept: 'image/*,.pdf' },
            ]},
            { id: 'review', title: 'Review & Submit', isReviewStep: true, fields: [] }
        ],
        readinessWeights: { required: 30, format: 20, crossField: 15, documents: 25, supporting: 10 }
    },

    'scholarship': {
        id: 'scholarship',
        title: 'Scholarship Application',
        category: 'education',
        sections: [
            { id: 'personal', title: 'Personal Details', fields: [
                { id: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name', audioKey: 'audio.fullName' },
                { id: 'dob', label: 'Date of Birth', type: 'date', required: true, audioKey: 'audio.dob' },
                { id: 'age', label: 'Age', type: 'number', validationType: 'age', required: true, placeholder: 'Age', audioKey: 'audio.age' },
                { id: 'gender', label: 'Gender', type: 'select', required: true, options: ['', 'Male', 'Female', 'Other'] },
                { id: 'fatherName', label: "Father's/Guardian's Name", type: 'text', required: true, placeholder: "Enter guardian's name", audioKey: 'audio.fatherName' },
            ]},
            { id: 'contact', title: 'Contact Details', fields: [
                { id: 'mobile', label: 'Mobile Number', type: 'tel', validationType: 'phone', required: true, placeholder: '10-digit mobile number', audioKey: 'audio.mobile' },
                { id: 'email', label: 'Email Address', type: 'email', validationType: 'email', required: true, placeholder: 'your.email@example.com', audioKey: 'audio.email' },
            ]},
            { id: 'address', title: 'Address Details', fields: [
                { id: 'address', label: 'Complete Address', type: 'textarea', required: true, audioKey: 'audio.address' },
                { id: 'state', label: 'State/UT', type: 'select', required: true, options: ['', ...INDIAN_STATES] },
                { id: 'district', label: 'District', type: 'text', required: true },
                { id: 'pin', label: 'PIN Code', type: 'text', validationType: 'pin', required: true, placeholder: '6-digit PIN', audioKey: 'audio.pin' },
            ]},
            { id: 'education', title: 'Educational Details', fields: [
                { id: 'institution', label: 'Institution Name', type: 'text', required: true, placeholder: 'School/College name' },
                { id: 'course', label: 'Course/Class', type: 'text', required: true, placeholder: 'Current course or class' },
                { id: 'percentage', label: 'Last Percentage/CGPA', type: 'text', required: true, placeholder: 'e.g., 85% or 8.5 CGPA' },
            ]},
            { id: 'income', title: 'Family Income', fields: [
                { id: 'annualIncome', label: 'Family Annual Income (₹)', type: 'number', required: true, placeholder: 'Family annual income', audioKey: 'audio.income' },
                { id: 'incomeSource', label: 'Source of Income', type: 'select', required: true, options: ['', 'Agriculture', 'Business', 'Government Employment', 'Private Employment', 'Self-Employed', 'Pension', 'Other'] },
            ]},
            { id: 'documents', title: 'Documents', fields: [
                { id: 'idProof', label: 'Identity Proof', type: 'file', required: true, accept: 'image/*,.pdf' },
                { id: 'marksheet', label: 'Last Marksheet', type: 'file', required: true, accept: 'image/*,.pdf' },
                { id: 'incomeCert', label: 'Income Certificate', type: 'file', required: false, accept: 'image/*,.pdf' },
            ]},
            { id: 'review', title: 'Review & Submit', isReviewStep: true, fields: [] }
        ],
        readinessWeights: { required: 25, format: 15, crossField: 15, documents: 30, supporting: 15 }
    },

    'health-scheme': {
        id: 'health-scheme',
        title: 'Health Scheme Application',
        category: 'healthcare',
        sections: [
            { id: 'personal', title: 'Personal Details', fields: [
                { id: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name', audioKey: 'audio.fullName' },
                { id: 'dob', label: 'Date of Birth', type: 'date', required: true, audioKey: 'audio.dob' },
                { id: 'age', label: 'Age', type: 'number', validationType: 'age', required: true, audioKey: 'audio.age' },
                { id: 'gender', label: 'Gender', type: 'select', required: true, options: ['', 'Male', 'Female', 'Other'] },
            ]},
            { id: 'contact', title: 'Contact Details', fields: [
                { id: 'mobile', label: 'Mobile', type: 'tel', validationType: 'phone', required: true, audioKey: 'audio.mobile' },
                { id: 'email', label: 'Email', type: 'email', validationType: 'email', required: false, audioKey: 'audio.email' },
            ]},
            { id: 'address', title: 'Address', fields: [
                { id: 'address', label: 'Address', type: 'textarea', required: true, audioKey: 'audio.address' },
                { id: 'state', label: 'State', type: 'select', required: true, options: ['', ...INDIAN_STATES] },
                { id: 'pin', label: 'PIN', type: 'text', validationType: 'pin', required: true, audioKey: 'audio.pin' },
            ]},
            { id: 'documents', title: 'Documents', fields: [
                { id: 'idProof', label: 'Identity Proof', type: 'file', required: true, accept: 'image/*,.pdf' },
                { id: 'incomeCert', label: 'Income Certificate', type: 'file', required: false, accept: 'image/*,.pdf' },
            ]},
            { id: 'review', title: 'Review & Submit', isReviewStep: true, fields: [] }
        ],
        readinessWeights: { required: 30, format: 20, crossField: 15, documents: 25, supporting: 10 }
    },

    'insurance': {
        id: 'insurance',
        title: 'Insurance Application',
        category: 'insurance',
        sections: [
            { id: 'personal', title: 'Personal Details', fields: [
                { id: 'fullName', label: 'Full Name', type: 'text', required: true, audioKey: 'audio.fullName' },
                { id: 'dob', label: 'Date of Birth', type: 'date', required: true, audioKey: 'audio.dob' },
                { id: 'age', label: 'Age', type: 'number', validationType: 'age', required: true, audioKey: 'audio.age' },
                { id: 'gender', label: 'Gender', type: 'select', required: true, options: ['', 'Male', 'Female', 'Other'] },
                { id: 'fatherName', label: "Father's Name", type: 'text', required: true, audioKey: 'audio.fatherName' },
            ]},
            { id: 'contact', title: 'Contact', fields: [
                { id: 'mobile', label: 'Mobile', type: 'tel', validationType: 'phone', required: true, audioKey: 'audio.mobile' },
                { id: 'email', label: 'Email', type: 'email', validationType: 'email', required: true, audioKey: 'audio.email' },
            ]},
            { id: 'address', title: 'Address', fields: [
                { id: 'address', label: 'Address', type: 'textarea', required: true, audioKey: 'audio.address' },
                { id: 'state', label: 'State', type: 'select', required: true, options: ['', ...INDIAN_STATES] },
                { id: 'district', label: 'District', type: 'text', required: true },
                { id: 'pin', label: 'PIN', type: 'text', validationType: 'pin', required: true, audioKey: 'audio.pin' },
            ]},
            { id: 'insurance', title: 'Insurance Details', fields: [
                { id: 'annualIncome', label: 'Annual Income (₹)', type: 'number', required: true, audioKey: 'audio.income' },
                { id: 'occupation', label: 'Occupation', type: 'text', required: true, audioKey: 'audio.occupation' },
                { id: 'nominee', label: 'Nominee Name', type: 'text', required: true, placeholder: 'Name of nominee' },
                { id: 'nomineeRelation', label: 'Nominee Relationship', type: 'select', required: true, options: ['', 'Spouse', 'Parent', 'Child', 'Sibling', 'Other'] },
            ]},
            { id: 'documents', title: 'Documents', fields: [
                { id: 'idProof', label: 'Identity Proof', type: 'file', required: true },
                { id: 'addressProof', label: 'Address Proof', type: 'file', required: false },
                { id: 'incomeProof', label: 'Income Proof', type: 'file', required: false },
            ]},
            { id: 'review', title: 'Review & Submit', isReviewStep: true, fields: [] }
        ],
        readinessWeights: { required: 25, format: 20, crossField: 20, documents: 20, supporting: 15 }
    },
};

// Get all fields for a form definition (flattened)
function getAllFormFields(formDef) {
    const fields = [];
    for (const section of formDef.sections) {
        for (const field of section.fields) {
            fields.push(field);
        }
    }
    return fields;
}

// Get services list for search/filter
function getServicesList() {
    return Object.values(FORM_DEFINITIONS).map(def => ({
        id: def.id,
        title: def.title,
        titleKey: def.titleKey,
        category: def.category,
        sections: def.sections.length,
        fields: getAllFormFields(def).length
    }));
}
