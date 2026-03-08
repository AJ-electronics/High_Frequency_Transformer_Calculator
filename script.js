const materials = {
    "N87": { curie: 220, bmax: 0.3, k: 3.2e-3, a: 1.46, b: 2.75 },
    "N97": { curie: 210, bmax: 0.32, k: 2.5e-3, a: 1.45, b: 2.7 },
    "PC40": { curie: 230, bmax: 0.35, k: 3e-3, a: 1.5, b: 2.8 },
    "3C90": { curie: 215, bmax: 0.3, k: 2.9e-3, a: 1.45, b: 2.75 },
    "3F3": { curie: 230, bmax: 0.35, k: 2.2e-3, a: 1.44, b: 2.6 }
};

const cores = {
    "ETD": [
        { name: "ETD29", Ap: 0.65, Ae: 70, le: 70.4, Aw: 92 }, // Ae in mm2, le in mm
        { name: "ETD39", Ap: 2.4, Ae: 125, le: 92.2, Aw: 174 },
        { name: "ETD44", Ap: 4.5, Ae: 173, le: 103, Aw: 213 },
        { name: "ETD49", Ap: 7.8, Ae: 211, le: 114, Aw: 273 },
        { name: "ETD59", Ap: 17, Ae: 368, le: 139, Aw: 365 }
    ],
    "EE": [
        { name: "EE30", Ap: 1.1, Ae: 110, le: 67, Aw: 80 },
        { name: "EE40", Ap: 2.6, Ae: 127, le: 77, Aw: 110 },
        { name: "EE55", Ap: 7.5, Ae: 354, le: 123, Aw: 250 }
    ]
};

const awg = {
    40: 0.080, 38: 0.101, 36: 0.127, 34: 0.160, 32: 0.202,
    30: 0.255, 28: 0.321, 26: 0.405, 24: 0.511, 22: 0.644,
    20: 0.812, 18: 1.024, 16: 1.291
};

let resultsData = {};

function calculate() {
    let Vin = parseFloat(document.getElementById("vin").value);
    let freqk = parseFloat(document.getElementById("freq").value);
    let P = parseFloat(document.getElementById("power").value);
    let f = freqk * 1000;
    let Bmax = materials[document.getElementById("material").value].bmax;

    // Area Product Formula: Ap = (Pt * 10^4) / (4 * f * Bmax * J * Ku)
    let J = 400; // Current density A/cm2
    let Ku = 0.4; // Window utilization
    let Ap_cm4 = (P) / (4 * f * Bmax * J * Ku * 1e-4);

    let corelist = cores[document.getElementById("coretype").value];
    let selectDropdown = document.getElementById("selectedCore");
    selectDropdown.innerHTML = "";
    
    let suggestions = "";
    corelist.forEach(c => {
        if (c.Ap >= Ap_cm4) {
            suggestions += `<li>${c.name}</li>`;
            let opt = document.createElement("option");
            opt.text = c.name;
            opt.value = c.name;
            selectDropdown.appendChild(opt);
        }
    });

    let skindepth = 66 / Math.sqrt(f); // mm

    document.getElementById("calcResults").innerHTML = `
        <strong>Minimum Area Product Required:</strong> ${Ap_cm4.toFixed(3)} cm⁴<br>
        <strong>Recommended Cores:</strong> <ul>${suggestions || "No cores large enough"}</ul>
        <strong>Skin Depth at ${freqk}kHz:</strong> ${skindepth.toFixed(3)} mm
    `;

    populateWire();
    resultsData = { Vin, freqk, P, Ap_cm4, skindepth };
}

function calculateTurns() {
    let Vin = parseFloat(document.getElementById("vin").value);
    let Vout = parseFloat(document.getElementById("vout").value);
    let f = parseFloat(document.getElementById("freq").value) * 1000;
    let Binput = parseFloat(document.getElementById("Buser").value);
    
    let selectedCoreName = document.getElementById("selectedCore").value;
    let core = cores[document.getElementById("coretype").value].find(c => c.name === selectedCoreName);
    
    // Faraday's Law: N = V / (4 * f * B * Ae)
    // Ae is in mm2, need to convert to m2 (* 1e-6)
    let Ae_m2 = core.Ae * 1e-6;
    let Np = Math.ceil(Vin / (4 * f * Binput * Ae_m2));
    let Ns = Math.ceil(Np * (Vout / Vin));

    document.getElementById("turnResults").innerHTML = `
        <strong>Primary Turns:</strong> ${Np}<br>
        <strong>Secondary Turns:</strong> ${Ns}
    `;

    // Core Loss Calculation (Steinmetz)
    let mat = materials[document.getElementById("material").value];
    let coreLoss = mat.k * Math.pow((f/1000), mat.a) * Math.pow(Binput, mat.b);
    document.getElementById("coreLossResults").innerHTML = `Estimated Core Loss: ${coreLoss.toFixed(3)} W/cm³`;

    Object.assign(resultsData, { Np, Ns, Binput, coreLoss });
}

function populateWire() {
    const pSel = document.getElementById("primaryWire");
    const sSel = document.getElementById("secondaryWire");
    pSel.innerHTML = ""; sSel.innerHTML = "";

    for (let g in awg) {
        let opt = `<option value="${awg[g]}">AWG ${g} (${awg[g]}mm)</option>`;
        pSel.innerHTML += opt;
        sSel.innerHTML += opt;
    }
}

function calculateStrands() {
    let Ip = resultsData.P / resultsData.Vin;
    let Is = resultsData.P / parseFloat(document.getElementById("vout").value);
    
    let dP = parseFloat(document.getElementById("primaryWire").value);
    let dS = parseFloat(document.getElementById("secondaryWire").value);

    // Current density limit ~4A/mm2
    let areaP = Math.PI * Math.pow(dP / 2, 2);
    let areaS = Math.PI * Math.pow(dS / 2, 2);

    let strandsP = Math.ceil((Ip / 4) / areaP);
    let strandsS = Math.ceil((Is / 4) / areaS);

    document.getElementById("strandResult").innerHTML = `
        <strong>Primary:</strong> ${strandsP} parallel strands<br>
        <strong>Secondary:</strong> ${strandsS} parallel strands
    `;
    
    document.getElementById("pdfBtn").style.display = "block";
}

async function askAI() {
    const resultsDiv = document.getElementById("aiResults");
    resultsDiv.innerText = "Consulting the Oracle...";

    // Security check: Don't hardcode keys!
    let apiKey = prompt("Please enter your Gemini API Key:");
    if(!apiKey) { resultsDiv.innerText = "API Key required."; return; }

    let promptText = `Analyze this HF Transformer design:
    Power: ${resultsData.P}W, Freq: ${resultsData.freqk}kHz, 
    Core: ${document.getElementById("selectedCore").value},
    Primary Turns: ${resultsData.Np}, Flux Density: ${resultsData.Binput}T.
    Is there a risk of saturation or excessive skin effect?`;

    try {
        let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        let data = await response.json();
        resultsDiv.innerText = data.candidates[0].content.parts[0].text;
    } catch (e) {
        resultsDiv.innerText = "Error connecting to AI.";
    }
}