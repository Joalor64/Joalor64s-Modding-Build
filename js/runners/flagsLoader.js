(function () {
    const flagData = {
        "DZ": "center 0.2287%", "AO": "center 0.4524%", "BJ": "center 0.6721%", "BW": "center 0.8958%",
        "BF": "center 1.1162%", "BI": "center 1.3379%", "CM": "center 1.5589%", "CV": "center 1.7805%",
        "CF": "center 2.0047%", "TD": "center 2.2247%", "CD": "left 2.4467%", "DJ": "left 2.6674%",
        "EG": "center 2.8931%", "GQ": "center 3.1125%", "ER": "left 3.3325%", "ET": "center 3.5542%",
        "GA": "center 3.7759%", "GM": "center 4.0015%", "GH": "center 4.2229%", "GN": "center 4.441%",
        "GW": "left 4.66663%", "CI": "center 4.8844%", "KE": "center 5.1061%", "LS": "center 5.3298%",
        "LR": "left 5.5495%", "LY": "center 5.7712%", "MG": "center 5.994%", "MW": "center 6.2156%",
        "ML": "center 6.4363%", "MR": "center 6.658%", "MU": "center 6.8805%", "YT": "center 7.1038%",
        "MA": "center 7.3231%", "MZ": "left 7.5448%", "NA": "left 7.7661%", "NE": "center 7.98937%",
        "NG": "center 8.2099%", "CG": "center 8.4316%", "RE": "center 8.6533%", "RW": "right 8.875%",
        "SH": "center 9.0967%", "ST": "center 9.32237%", "SN": "center 9.5426%", "SC": "left 9.7628%",
        "SL": "center 9.9845%", "SO": "center 10.2052%", "ZA": "left 10.4269%", "SS": "left 10.6486%",
        "SD": "center 10.8703%", "SR": "center 11.0945%", "SZ": "center 11.3135%", "TG": "left 11.5354%",
        "TN": "center 11.7593%", "UG": "center 11.9799%", "TZ": "center 12.2005%", "EH": "center 12.4222%",
        "YE": "center 12.644%", "ZM": "center 12.8664%", "ZW": "left 13.0873%", "AI": "center 13.309%",
        "AG": "center 13.5307%", "AR": "center 13.7524%", "AW": "left 13.9741%", "BS": "left 14.1958%",
        "BB": "center 14.4175%", "BQ": "center 14.6415%", "BZ": "center 14.8609%", "BM": "center 15.0826%",
        "BO": "center 15.306%", "VG": "center 15.528%", "BR": "center 15.7496%", "CA": "center 15.9694%",
        "KY": "center 16.1911%", "CL": "left 16.4128%", "CO": "left 16.6345%", "KM": "center 16.8562%",
        "CR": "center 17.0779%", "CU": "left 17.2996%", "CW": "center 17.5213%", "DM": "center 17.743%",
        "DO": "center 17.968%", "EC": "center 18.1864%", "SV": "center 18.4081%", "FK": "center 18.6298%",
        "GF": "center 18.8515%", "GL": "left 19.0732%", "GD": "center 19.2987%", "GP": "center 19.518%",
        "GT": "center 19.7383%", "GY": "center 19.96%", "HT": "center 20.1817%", "HN": "center 20.4034%",
        "JM": "center 20.6241%", "MQ": "center 20.8468%", "MX": "center 21.0685%", "MS": "center 21.2902%",
        "NI": "center 21.5119%", "PA": "center 21.7336%", "PY": "center 21.9553%", "PE": "center 22.177%",
        "PR": "left 22.4002%", "BL": "center 22.6204%", "KN": "center 22.8421%", "LC": "center 23.0638%",
        "PM": "center 23.2855%", "VC": "center 23.5072%", "SX": "left 23.732%", "TT": "center 23.9506%",
        "TC": "center 24.1723%", "US": "center 24.392%", "VI": "center 24.6157%", "UY": "left 24.8374%",
        "VE": "center 25.0591%", "AB": "center 25.279%", "AF": "center 25.5025%", "AZ": "center 25.7242%",
        "BD": "center 25.9459%", "BT": "center 26.1676%", "BN": "center 26.3885%", "KH": "center 26.611%",
        "CN": "left 26.8327%", "GE": "center 27.0544%", "HK": "center 27.2761%", "IN": "center 27.4978%",
        "ID": "center 27.7195%", "JP": "center 27.9412%", "KZ": "center 28.1615%", "LA": "center 28.3846%",
        "MO": "center 28.6063%", "MY": "center 28.829%", "MV": "center 29.0497%", "MN": "left 29.2714%",
        "MM": "center 29.4931%", "NP": "left 29.7148%", "KP": "left 29.9365%", "MP": "center 30.1582%",
        "PW": "center 30.3799%", "PG": "center 30.6016%", "PH": "left 30.8233%", "SG": "left 31.045%",
        "KR": "center 31.2667%", "LK": "right 31.4884%", "TW": "left 31.7101%", "TJ": "center 31.9318%",
        "TH": "center 32.1535%", "TL": "left 32.3752%", "TM": "center 32.5969%", "VN": "center 32.8186%",
        "AX": "center 33.0403%", "AL": "center 33.25975%", "AD": "center 33.4837%", "AM": "center 33.7054%",
        "AT": "center 33.9271%", "BY": "left 34.1488%", "BE": "center 34.3705%", "BA": "center 34.5922%",
        "BG": "center 34.8139%", "HR": "center 35.0356%", "CY": "center 35.2555%", "CZ": "left 35.479%",
        "DK": "center 35.7007%", "EE": "center 35.9224%", "FO": "center 36.1441%", "FI": "center 36.3658%",
        "FR": "center 36.5875%", "DE": "center 36.8092%", "GI": "center 37.0309%", "GR": "left 37.2526%",
        "GG": "center 37.4743%", "HU": "center 37.696%", "IS": "center 37.9177%", "IE": "center 38.1394%",
        "IM": "center 38.3611%", "IT": "center 38.5828%", "JE": "center 38.8045%", "XK": "center 39.0262%",
        "LV": "center 39.2479%", "LI": "left 39.4696%", "LT": "center 39.6913%", "LU": "center 39.913%",
        "MT": "left 40.1347%", "MD": "center 40.3564%", "MC": "center 40.5781%", "ME": "center 40.7998%",
        "NL": "center 41.0215%", "MK": "center 41.2432%", "NO": "center 41.4649%", "PL": "center 41.6866%",
        "PT": "center 41.9083%", "RO": "center 42.13%", "RU": "center 42.3517%", "SM": "center 42.5734%",
        "RS": "center 42.7951%", "SK": "center 43.0168%", "SI": "center 43.2385%", "ES": "left 43.4602%",
        "SE": "center 43.6819%", "CH": "center 43.9036%", "TR": "center 44.1253%", "UA": "center 44.347%",
        "GB": "center 44.5687%", "VA": "right 44.7904%", "BH": "center 45.0121%", "IR": "center 45.2338%",
        "IQ": "center 45.4555%", "IL": "center 45.6772%", "KW": "left 45.897%", "JO": "left 46.1206%",
        "KG": "center 46.3423%", "LB": "center 46.561%", "OM": "left 46.7857%", "PK": "center 47.0074%",
        "PS": "center 47.2291%", "QA": "center 47.4508%", "SA": "center 47.6725%", "SY": "center 47.8942%",
        "AE": "center 48.1159%", "UZ": "left 48.3376%", "AS": "right 48.5593%", "AU": "center 48.781%",
        "CX": "center 49.002%", "CC": "center 49.2244%", "CK": "center 49.4445%", "FJ": "center 49.6678%",
        "PF": "center 49.8895%", "GU": "center 50.1112%", "KI": "center 50.3329%", "MH": "left 50.5546%",
        "FM": "center 50.7763%", "NC": "center 50.998%", "NZ": "center 51.2197%", "NR": "left 51.4414%",
        "NU": "center 51.6631%", "NF": "center 51.8848%", "WS": "left 52.1065%", "SB": "left 52.3282%",
        "TK": "center 52.5499%", "TO": "left 52.7716%", "TV": "center 52.9933%", "VU": "left 53.215%",
        "WF": "center 53.4385%", "AQ": "center 53.6584%", "EU": "center 53.875%", "JR": "center 54.099%",
        "OLY": "center 54.32%", "UN": "center 54.54%"
    };

    const applyFlags = () => {
        document.querySelectorAll('.fflag').forEach(el => {
            const match = el.className.match(/fflag-([A-Z]{2,3})/);
            if (match) {
                const code = match[1].toUpperCase();
                if (flagData[code]) {
                    el.style.backgroundPosition = flagData[code];
                }
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyFlags);
    } else {
        applyFlags();
    }

    window.initFlags = applyFlags;
    console.log("Flags initialized successfully.");
})();