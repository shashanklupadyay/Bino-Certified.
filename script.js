document.addEventListener('DOMContentLoaded', () => {
    // --- Section 1: Badge Generator Elements ---
    const verificationStep = document.getElementById('verification-step');
    const badgeGenerator = document.getElementById('badge-generator');
    const partnerIdInput = document.getElementById('partner-id-input');
    const verifyIdBtn = document.getElementById('verify-id-btn');
    const errorMessage = document.getElementById('error-message');

    const businessNameInput = document.getElementById('business-name');
    const businessSloganInput = document.getElementById('business-slogan');
    const logoUploadInput = document.getElementById('logo-upload');
    const businessNameDisplay = document.getElementById('business-name-display');
    const businessSloganDisplay = document.getElementById('business-slogan-display');
    const businessLogo = document.getElementById('business-logo');
    const generateBadgeBtn = document.getElementById('generate-badge-btn');
    const downloadBadgeBtn = document.getElementById('download-badge-btn');

    // --- Section 2: QR Code Verifier Elements ---
    const qrCodeUploadInput = document.getElementById('qr-code-upload');
    const verifyQrBtn = document.getElementById('verify-qr-btn');
    const qrUploadMessage = document.getElementById('qr-upload-message');
    const qrCanvas = document.getElementById('qr-canvas');
    const ctx = qrCanvas.getContext('2d');
    const verificationDisplay = document.getElementById('verification-display');
    const verificationResult = document.getElementById('verification-result');

    let currentUUID = '';
    let badgeData = [];

    // Load data.json on page load
    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            badgeData = await response.json();
        } catch (error) {
            console.error('Failed to load JSON file:', error);
            errorMessage.textContent = 'Error loading data. Please try again later.';
            errorMessage.style.display = 'block';
        }
    }
    
    loadData();

    // --- Section 1 Logic: Badge Generation ---
    verifyIdBtn.addEventListener('click', () => {
        // The entered ID is now used as the UUID directly
        const partnerId = partnerIdInput.value.trim().toUpperCase() || crypto.randomUUID();
        
        verificationStep.classList.add('hidden');
        badgeGenerator.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        
        currentUUID = partnerId; // Use the entered ID as the UUID
        generateBadge();
    });

    businessNameInput.addEventListener('input', () => {
        businessNameDisplay.textContent = businessNameInput.value || 'Your Business Name';
    });
    businessSloganInput.addEventListener('input', () => {
        businessSloganDisplay.textContent = businessSloganInput.value || 'A trusted partner of Bino.';
    });
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

    generateBadgeBtn.addEventListener('click', generateBadge);
    function generateBadge() {
        // If a partner ID was entered, we use it; otherwise, we generate one
        const uuidToUse = partnerIdInput.value.trim().toUpperCase() || crypto.randomUUID();
        generateQRCode(`?id=${uuidToUse}`);
    }

    function generateQRCode(text) {
        const qrCodeContainer = document.getElementById('qr-code-container');
        qrCodeContainer.innerHTML = '';
        new QRCode(qrCodeContainer, {
            text: text,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

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
            
            const newBadge = {
                uuid: partnerIdInput.value.trim().toUpperCase() || crypto.randomUUID(),
                businessName: businessNameInput.value,
                slogan: businessSloganInput.value
            };
            badgeData.push(newBadge);
            downloadJson(badgeData, 'data.json');
        });
    }

    function downloadJson(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // --- Section 2 Logic: QR Code Verification ---
    verifyQrBtn.addEventListener('click', () => {
        const file = qrCodeUploadInput.files[0];
        if (!file) {
            qrUploadMessage.textContent = 'Please upload a QR code image first.';
            qrUploadMessage.classList.remove('hidden');
            return;
        }
        
        qrUploadMessage.classList.add('hidden');
        verificationDisplay.classList.add('hidden');

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                qrCanvas.width = img.width;
                qrCanvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                const imageData = ctx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    const qrData = code.data;
                    const url = new URL(qrData, window.location.origin);
                    const id = url.searchParams.get('id');

                    if (id) {
                        const verifiedBadge = badgeData.find(item => item.uuid === id);
                        if (verifiedBadge) {
                            verificationResult.textContent = `✅ Verified! Business: ${verifiedBadge.businessName}`;
                            verificationResult.classList.remove('invalid');
                            verificationResult.classList.add('verified');
                        } else {
                            verificationResult.textContent = '❌ Invalid Bino ID. Badge is not genuine.';
                            verificationResult.classList.remove('verified');
                            verificationResult.classList.add('invalid');
                        }
                    } else {
                        verificationResult.textContent = '❌ No Bino ID found in the QR code.';
                        verificationResult.classList.remove('verified');
                        verificationResult.classList.add('invalid');
                    }
                } else {
                    verificationResult.textContent = '❌ No QR code found in the image.';
                    verificationResult.classList.remove('verified');
                    verificationResult.classList.add('invalid');
                }
                verificationDisplay.classList.remove('hidden');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
});