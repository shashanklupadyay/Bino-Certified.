document.addEventListener('DOMContentLoaded', () => {
    const resultDiv = document.getElementById('verification-result');

    async function verifyBadge() {
        try {
            // Fetch the JSON data
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const badgeData = await response.json();

            // Get UUID from the URL
            function getUrlParameter(name) {
                name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
                const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
                const results = regex.exec(location.search);
                return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
            }

            const partnerIdFromUrl = getUrlParameter('id');

            if (partnerIdFromUrl) {
                // Find the badge in the JSON data
                const verifiedBadge = badgeData.find(item => item.uuid === partnerIdFromUrl);

                if (verifiedBadge) {
                    resultDiv.textContent = `Bino ID Verified for: ${verifiedBadge.businessName} 🎉`;
                    resultDiv.classList.add('verified');
                } else {
                    resultDiv.textContent = 'Invalid Bino ID. Badge is not genuine.';
                    resultDiv.classList.add('invalid');
                }
            } else {
                resultDiv.textContent = 'No Bino ID found in the URL.';
                resultDiv.classList.add('invalid');
            }
        } catch (error) {
            console.error('Failed to load JSON for verification:', error);
            resultDiv.textContent = 'Verification service is currently unavailable.';
            resultDiv.classList.add('invalid');
        }
    }

    verifyBadge();
});