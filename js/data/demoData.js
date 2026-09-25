/**
 * NSGP Demo Data
 * Test data for demonstrating error detection and form features
 */
const DEMO_DATA = {
    // Pre-filled data with intentional errors for error detection demo
    errorDemo: {
        serviceId: 'income-certificate',
        formData: {
            fullName: 'Ashish Kumar',          // Mismatch: document says "Ashish Kumar Singh"
            dob: '2005-05-10',
            age: '30',                          // Error: DOB says age should be ~21
            gender: 'Male',
            fatherName: 'Rajesh Kumar Singh',
            mobile: '9876543210',
            email: 'ashish@gmial.com',          // Error: typo in domain
            address: '123, Ram Nagar, Sector 5',
            state: 'Uttar Pradesh',
            district: 'Lucknow',
            pin: '123',                         // Error: invalid PIN (only 3 digits)
            annualIncome: '250000',
            incomeSource: 'Business',
            occupation: 'Shop Owner',
        },
        ocrData: {
            name: 'Ashish Kumar Singh',         // Document has different name
            dob: '2005-05-10',
            address: '123, Ram Nagar, Sector 5, Lucknow, UP',
            pin: '226001',
            gender: 'Male',
        }
    },

    // Clean test user data
    testUser: {
        fullName: 'Ashish Kumar Singh',
        dob: '2005-05-10',
        age: '21',
        gender: 'Male',
        fatherName: 'Rajesh Kumar Singh',
        mobile: '9876543210',
        email: 'ashish@gmail.com',
        address: '123, Ram Nagar, Sector 5, Lucknow',
        state: 'Uttar Pradesh',
        district: 'Lucknow',
        pin: '226001',
        aadhaar: 'XXXX XXXX 1234',
        annualIncome: '250000',
        incomeSource: 'Business',
        occupation: 'Shop Owner',
        duration: '15',
    }
};
