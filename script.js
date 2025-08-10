document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements for the two states
    const verificationStep = document.getElementById('verification-step');
    const badgeGenerator = document.getElementById('badge-generator');
    const partnerIdInput = document.getElementById('partner-id-input');
    const verifyBtn = document.getElementById('verify-id-btn');
    const errorMessage = document.getElementById('error-message');

    // Hardcoded list of valid IDs for the demo
    const validPartnerIds = ['BINO-12345', 'BINO-67890', 'BINO-ALPHA'];

    // DOM Elements for the Badge Generator
    const businessNameInput = document.getElementById('business-name');
    const businessSloganInput = document.getElementById('business-slogan');
    const logoUploadInput = document.getElementById('logo-upload');
    const businessNameDisplay = document.getElementById('business-name-display');
    const businessSloganDisplay = document.getElementById('business-slogan-display');
    const businessLogo = document.getElementById('business-logo');
    const generateBadgeBtn = document.getElementById('generate-badge-btn');
    const downloadBadgeBtn = document.getElementById('download-badge-btn');
    
    let currentUUID = '';

    // --- State 1: Verification Logic ---
    verifyBtn.addEventListener('click', () => {
        const enteredId = partnerIdInput.value.trim().toUpperCase();

        if (validPartnerIds.includes(enteredId)) {
            verificationStep.style.display = 'none';
            badgeGenerator.style.display = 'block';
            errorMessage.style.display = 'none';
            // Trigger initial badge generation with a UUID
            generateBadge();
        } else {
            errorMessage.textContent = 'Invalid Partner ID. Please try again.';
            errorMessage.style.display = 'block';
        }
    });

    // --- State 2: Badge Generation Logic ---

    // Live update the badge preview as the user types
    businessNameInput.addEventListener('input', () => {
        businessNameDisplay.textContent = businessNameInput.value || 'Your Business Name';
    });
    businessSloganInput.addEventListener('input', () => {
        businessSloganDisplay.textContent = businessSloganInput.value || 'A trusted partner of Bino.';
    });

    // Handle logo upload
    logoUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                businessLogo.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Main function to generate the badge with a new QR code
    generateBadgeBtn.addEventListener('click', generateBadge);

    function generateBadge() {
        currentUUID = crypto.randomUUID();
        generateQRCode(currentUUID);
    }
    
    // Function to generate the QR code
    function generateQRCode(uuid) {
        const qrCodeContainer = document.getElementById('qr-code-container');
        qrCodeContainer.innerHTML = '';
        new QRCode(qrCodeContainer, {
            text: `https://bino.bot/verify?id=${uuid}`,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    // Function to download the badge as a PNG image
    downloadBadgeBtn.addEventListener('click', downloadBadge);

    function downloadBadge() {
        const badgeElement = document.getElementById('badge-preview');
        html2canvas(badgeElement, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = `bino-certified-${businessNameInput.value.replace(/ /g, '-') || 'badge'}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});