/* ============================================================
   FUZZ — qr-login.js (v2)
   Desktop: QR ko'rsatadi. Mobile: QR skanerlaydi.
   ============================================================ */

(function () {
    "use strict";

    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        .test(navigator.userAgent);
    const isDesktop = !isMobile;


    /* ==========================================================
       1. QR KO'RSATISH (desktop)
       ========================================================== */

    function renderQRCode(container) {
        if (!container) return;

        if (!isDesktop) {
            container.innerHTML = `<p class="text-muted">${
                window.FuzzLang ? FuzzLang.t("auth_qr_only_desktop")
                                : "QR display is only available on desktop."
            }</p>`;
            return;
        }

        const token = "fuzz_" + Math.random().toString(36).slice(2, 12);
        localStorage.setItem("fuzz_qr_token", token);

        const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(token)}`;

        container.innerHTML = `
            <div class="qr-block">
                <img class="qr-image" src="${qrURL}" alt="QR code" id="qr-image">
                <p class="text-muted" style="text-align:center;">
                    ${window.FuzzLang ? FuzzLang.t("auth_qr_hint") : "Open the app on your phone and scan this code."}
                </p>
                <p class="text-dim" style="font-family:monospace;">${token}</p>
            </div>
        `;
    }


    /* ==========================================================
       2. QR SKANERLASH (mobile)
       ========================================================== */

    async function startQRScanner(container) {
        if (!container) return;

        if (!isMobile) {
            container.innerHTML = `<p class="text-muted">${
                window.FuzzLang ? FuzzLang.t("auth_qr_only_mobile")
                                : "QR scanning is only available on mobile devices."
            }</p>`;
            return;
        }

        container.innerHTML = `
            <div class="qr-scanner">
                <video id="qr-video" autoplay playsinline style="width:100%;height:100%;object-fit:cover;"></video>
            </div>
            <button class="btn-ghost" id="qr-scan-stop" style="margin-top:12px;width:100%;">
                ${window.FuzzLang ? FuzzLang.t("cancel") : "Cancel"}
            </button>
        `;

        const video = document.getElementById("qr-video");
        const stopBtn = document.getElementById("qr-scan-stop");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            video.srcObject = stream;

            const stop = () => {
                stream.getTracks().forEach(t => t.stop());
                container.innerHTML = "";
            };
            stopBtn?.addEventListener("click", stop);

            if ("BarcodeDetector" in window) {
                const detector = new BarcodeDetector({ formats: ["qr_code"] });
                const scan = async () => {
                    try {
                        const codes = await detector.detect(video);
                        if (codes.length > 0) {
                            handleQRResult(codes[0].rawValue);
                            stop();
                            return;
                        }
                    } catch { /* jim */ }
                    requestAnimationFrame(scan);
                };
                scan();
            }
        } catch (err) {
            console.warn("[qr-login.js] kamera xatosi:", err);
            container.innerHTML = `<p class="text-danger">Camera access denied.</p>`;
        }
    }


    /* ==========================================================
       3. QR NATIJASI
       ========================================================== */

    function handleQRResult(token) {
        const saved = localStorage.getItem("fuzz_qr_token");
        if (saved && token === saved) {
            window.FuzzAuth?.mockLogin();
        } else {
            if (window.FuzzToast) FuzzToast.error("Invalid QR code");
        }
    }


    /* ==========================================================
       4. PUBLIC API
       ========================================================== */

    window.FuzzQR = {
        isMobile,
        isDesktop,
        renderQRCode,
        startQRScanner
    };

})();