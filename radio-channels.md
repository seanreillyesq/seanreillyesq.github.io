---
layout: page
title: Radio Channels
description: Channel plan for my Quansheng UV-K5 handhelds
header-img: "img/home-bg.jpg"
meta-description: Channel list for my Quansheng UV-K5 radios - PMR446, marine VHF, airband and weather. Reference page.
robots: noindex
hidden: true
sitemap: false
permalink: /radio-channels/
---


The channel plan programmed into my pair of Quansheng UV-K5 handhelds (running F4HWN
firmware). It is mostly a **receive / scanner** setup: the only channels the radios can
transmit on are licence-free **PMR446** and the two **Alpine** convention channels, both
at 500&nbsp;mW. Everything else - marine, airband, aviation weather, amateur and weather
satellites - is **receive-only** and hardware TX-locked, since I hold no licence for those
bands.

Frequencies in MHz. Marine channels use mnemonic memory numbers (100&nbsp;+&nbsp;channel for
the ship side, 200&nbsp;+&nbsp;channel for the coast/shore side). Airband frequencies were
checked against public sources but services and ATIS frequencies change - verify against the
UK AIP before relying on any of them.

_Last updated: 23 June 2026._


## PMR446 - licence-free

| Ch | Name | Freq (MHz) | Mode | TX | What it is |
|---|---|---|---|---|---|
| 1 | PMR-01 | 446.0063 | NFM | 500&nbsp;mW | PMR446 channel 1 |
| 2 | PMR-02 | 446.0188 | NFM | 500&nbsp;mW | PMR446 channel 2 |
| 3 | PMR-03 | 446.0312 | NFM | 500&nbsp;mW | PMR446 channel 3 |
| 4 | PMR-04 | 446.0437 | NFM | 500&nbsp;mW | PMR446 channel 4 |
| 5 | PMR-05 | 446.0562 | NFM | 500&nbsp;mW | PMR446 channel 5 |
| 6 | PMR-06 | 446.0688 | NFM | 500&nbsp;mW | PMR446 channel 6 |
| 7 | PMR-07 | 446.0813 | NFM | 500&nbsp;mW | PMR446 channel 7 |
| 8 | PMR-08 | 446.0938 | NFM | 500&nbsp;mW | PMR446 channel 8 |
| 9 | PMR-09 | 446.1062 | NFM | 500&nbsp;mW | PMR446 channel 9 |
| 10 | PMR-10 | 446.1187 | NFM | 500&nbsp;mW | PMR446 channel 10 |
| 11 | PMR-11 | 446.1313 | NFM | 500&nbsp;mW | PMR446 channel 11 |
| 12 | PMR-12 | 446.1438 | NFM | 500&nbsp;mW | PMR446 channel 12 |
| 13 | PMR-13 | 446.1562 | NFM | 500&nbsp;mW | PMR446 channel 13 |
| 14 | PMR-14 | 446.1687 | NFM | 500&nbsp;mW | PMR446 channel 14 |
| 15 | PMR-15 | 446.1812 | NFM | 500&nbsp;mW | PMR446 channel 15 |
| 16 | PMR-16 | 446.1938 | NFM | 500&nbsp;mW | PMR446 channel 16 |

## Alpine PMR emergency convention

| Ch | Name | Freq (MHz) | Mode | TX | What it is |
|---|---|---|---|---|---|
| 17 | ALP7-FR | 446.0813 | NFM | 500&nbsp;mW | Alpine Canal 7-7 FR/ES TXtone 85.4 |
| 18 | ALP8-IT | 446.0938 | NFM | 500&nbsp;mW | Alpine Rete Radio Montana IT TXtone 114.8 |

## Airband - common

| Ch | Name | Freq (MHz) | Mode | TX | What it is |
|---|---|---|---|---|---|
| 29 | AIR-GRD | 121.5000 | AM | RX only | Aviation Guard 121.5 |
| 30 | AIR-SAR | 123.1000 | AM | RX only | Aviation SAR 123.1 |
| 31 | AIR-A2A | 123.4500 | AM | RX only | Air-to-air 123.45 unofficial |

## VOLMET - aviation weather

| Ch | Name | Freq (MHz) | Mode | TX | What it is |
|---|---|---|---|---|---|
| 32 | VOL-LDN | 135.3750 | AM | RX only | London VOLMET Main wx |
| 33 | VOL-STH | 128.6000 | AM | RX only | London VOLMET South wx |
| 34 | VOL-NTH | 126.6000 | AM | RX only | London VOLMET North wx |
| 35 | VOL-SCO | 125.7250 | AM | RX only | Scottish VOLMET wx |

## Weather satellites (NOAA APT)

| Ch | Name | Freq (MHz) | Mode | TX | What it is |
|---|---|---|---|---|---|
| 36 | WX-N19 | 137.1000 | FM | RX only | NOAA-19 APT weather sat |
| 37 | WX-N15 | 137.6200 | FM | RX only | NOAA-15 APT weather sat |
| 38 | WX-N18 | 137.9125 | FM | RX only | NOAA-18 APT weather sat |

## Amateur bands

| Ch | Name | Freq (MHz) | Mode | TX | What it is |
|---|---|---|---|---|---|
| 39 | 2M-CALL | 145.5000 | FM | RX only | 2m FM calling/SOTA |
| 40 | 70-CALL | 433.5000 | FM | RX only | 70cm FM calling |
| 41 | APRS | 144.8000 | FM | RX only | 2m APRS data |
| 42 | 4M-CALL | 70.4500 | FM | RX only | 4m FM calling |
| 43 | ISS | 145.8000 | FM | RX only | ISS voice/SSTV downlink |

## Marine VHF - ship / simplex

| Ch | Name | Freq (MHz) | Mode | TX | What it is |
|---|---|---|---|---|---|
| 101 | MAR01 | 156.0500 | FM | RX only | Marine ch 1 (ship / inter-ship) - Port operations / working |
| 102 | MAR02 | 156.1000 | FM | RX only | Marine ch 2 (ship / inter-ship) - Port operations / working |
| 103 | MAR03 | 156.1500 | FM | RX only | Marine ch 3 (ship / inter-ship) - Port operations / working |
| 104 | MAR04 | 156.2000 | FM | RX only | Marine ch 4 (ship / inter-ship) - Port operations / working |
| 105 | MAR05 | 156.2500 | FM | RX only | Marine ch 5 (ship / inter-ship) - Port operations / working |
| 106 | MAR06 | 156.3000 | FM | RX only | Marine ch 6 (ship / inter-ship) - Inter-ship safety |
| 107 | MAR07 | 156.3500 | FM | RX only | Marine ch 7 (ship / inter-ship) - Port operations / working |
| 108 | MAR08 | 156.4000 | FM | RX only | Marine ch 8 (ship / inter-ship) - Inter-ship |
| 109 | MAR09 | 156.4500 | FM | RX only | Marine ch 9 (ship / inter-ship) - Calling / marinas |
| 110 | MAR10 | 156.5000 | FM | RX only | Marine ch 10 (ship / inter-ship) - Coastguard / port ops |
| 111 | MAR11 | 156.5500 | FM | RX only | Marine ch 11 (ship / inter-ship) - Port operations / working |
| 112 | MAR12 | 156.6000 | FM | RX only | Marine ch 12 (ship / inter-ship) - Port operations / working |
| 113 | MAR13 | 156.6500 | FM | RX only | Marine ch 13 (ship / inter-ship) - Bridge-to-bridge navigation |
| 114 | MAR14 | 156.7000 | FM | RX only | Marine ch 14 (ship / inter-ship) - Port operations / working |
| 115 | MAR15 | 156.7500 | FM | RX only | Marine ch 15 (ship / inter-ship) - Port operations / working |
| 116 | MAR16 | 156.8000 | FM | RX only | Marine ch 16 (ship / inter-ship) - Distress, safety & calling |
| 117 | MAR17 | 156.8500 | FM | RX only | Marine ch 17 (ship / inter-ship) - Port operations / working |
| 118 | MAR18 | 156.9000 | FM | RX only | Marine ch 18 (ship / inter-ship) - Port operations / working |
| 119 | MAR19 | 156.9500 | FM | RX only | Marine ch 19 (ship / inter-ship) - Port operations / working |
| 120 | MAR20 | 157.0000 | FM | RX only | Marine ch 20 (ship / inter-ship) - Port operations / working |
| 121 | MAR21 | 157.0500 | FM | RX only | Marine ch 21 (ship / inter-ship) - Port operations / working |
| 122 | MAR22 | 157.1000 | FM | RX only | Marine ch 22 (ship / inter-ship) - Port operations / working |
| 123 | MAR23 | 157.1500 | FM | RX only | Marine ch 23 (ship / inter-ship) - Port operations / working |
| 124 | MAR24 | 157.2000 | FM | RX only | Marine ch 24 (ship / inter-ship) - Port operations / working |
| 125 | MAR25 | 157.2500 | FM | RX only | Marine ch 25 (ship / inter-ship) - Port operations / working |
| 126 | MAR26 | 157.3000 | FM | RX only | Marine ch 26 (ship / inter-ship) - Port operations / working |
| 127 | MAR27 | 157.3500 | FM | RX only | Marine ch 27 (ship / inter-ship) - Port operations / working |
| 128 | MAR28 | 157.4000 | FM | RX only | Marine ch 28 (ship / inter-ship) - Port operations / working |
| 160 | MAR60 | 156.0250 | FM | RX only | Marine ch 60 (ship / inter-ship) - Port operations / working |
| 161 | MAR61 | 156.0750 | FM | RX only | Marine ch 61 (ship / inter-ship) - Port operations / working |
| 162 | MAR62 | 156.1250 | FM | RX only | Marine ch 62 (ship / inter-ship) - Port operations / working |
| 163 | MAR63 | 156.1750 | FM | RX only | Marine ch 63 (ship / inter-ship) - Port operations / working |
| 164 | MAR64 | 156.2250 | FM | RX only | Marine ch 64 (ship / inter-ship) - Port operations / working |
| 165 | MAR65 | 156.2750 | FM | RX only | Marine ch 65 (ship / inter-ship) - SAR / working |
| 166 | MAR66 | 156.3250 | FM | RX only | Marine ch 66 (ship / inter-ship) - Port operations / working |
| 167 | MAR67 | 156.3750 | FM | RX only | Marine ch 67 (ship / inter-ship) - UK small craft safety / Coastguard |
| 168 | MAR68 | 156.4250 | FM | RX only | Marine ch 68 (ship / inter-ship) - Port operations / working |
| 169 | MAR69 | 156.4750 | FM | RX only | Marine ch 69 (ship / inter-ship) - Port operations / working |
| 170 | MAR70 | 156.5250 | FM | RX only | Marine ch 70 (ship / inter-ship) - DSC digital calling (data only, no voice) |
| 171 | MAR71 | 156.5750 | FM | RX only | Marine ch 71 (ship / inter-ship) - Port operations / working |
| 172 | MAR72 | 156.6250 | FM | RX only | Marine ch 72 (ship / inter-ship) - Inter-ship |
| 173 | MAR73 | 156.6750 | FM | RX only | Marine ch 73 (ship / inter-ship) - Coastguard MSI broadcasts |
| 174 | MAR74 | 156.7250 | FM | RX only | Marine ch 74 (ship / inter-ship) - Port operations / working |
| 175 | MAR75 | 156.7750 | FM | RX only | Marine ch 75 (ship / inter-ship) - Port operations / working |
| 176 | MAR76 | 156.8250 | FM | RX only | Marine ch 76 (ship / inter-ship) - Port operations / working |
| 177 | MAR77 | 156.8750 | FM | RX only | Marine ch 77 (ship / inter-ship) - Inter-ship |
| 178 | MAR78 | 156.9250 | FM | RX only | Marine ch 78 (ship / inter-ship) - Port operations / working |
| 179 | MAR79 | 156.9750 | FM | RX only | Marine ch 79 (ship / inter-ship) - Port operations / working |
| 180 | MAR80 | 157.0250 | FM | RX only | Marine ch 80 (ship / inter-ship) - UK primary marina working channel |
| 181 | MAR81 | 157.0750 | FM | RX only | Marine ch 81 (ship / inter-ship) - Port operations / working |
| 182 | MAR82 | 157.1250 | FM | RX only | Marine ch 82 (ship / inter-ship) - Port operations / working |
| 183 | MAR83 | 157.1750 | FM | RX only | Marine ch 83 (ship / inter-ship) - Port operations / working |
| 184 | MAR84 | 157.2250 | FM | RX only | Marine ch 84 (ship / inter-ship) - Port operations / working |
| 185 | MAR85 | 157.2750 | FM | RX only | Marine ch 85 (ship / inter-ship) - Port operations / working |
| 186 | MAR86 | 157.3250 | FM | RX only | Marine ch 86 (ship / inter-ship) - Port operations / working |
| 187 | MAR87 | 157.3750 | FM | RX only | Marine ch 87 (ship / inter-ship) - Port operations / working |
| 188 | MAR88 | 157.4250 | FM | RX only | Marine ch 88 (ship / inter-ship) - Port operations / working |

## Marine VHF - coast / shore station

| Ch | Name | Freq (MHz) | Mode | TX | What it is |
|---|---|---|---|---|---|
| 201 | MAR01-C | 160.6500 | FM | RX only | Marine ch 1 (coast/shore station) - Port operations / working |
| 202 | MAR02-C | 160.7000 | FM | RX only | Marine ch 2 (coast/shore station) - Port operations / working |
| 203 | MAR03-C | 160.7500 | FM | RX only | Marine ch 3 (coast/shore station) - Port operations / working |
| 204 | MAR04-C | 160.8000 | FM | RX only | Marine ch 4 (coast/shore station) - Port operations / working |
| 205 | MAR05-C | 160.8500 | FM | RX only | Marine ch 5 (coast/shore station) - Port operations / working |
| 207 | MAR07-C | 160.9500 | FM | RX only | Marine ch 7 (coast/shore station) - Port operations / working |
| 218 | MAR18-C | 161.5000 | FM | RX only | Marine ch 18 (coast/shore station) - Port operations / working |
| 219 | MAR19-C | 161.5500 | FM | RX only | Marine ch 19 (coast/shore station) - Port operations / working |
| 220 | MAR20-C | 161.6000 | FM | RX only | Marine ch 20 (coast/shore station) - Port operations / working |
| 221 | MAR21-C | 161.6500 | FM | RX only | Marine ch 21 (coast/shore station) - Port operations / working |
| 222 | MAR22-C | 161.7000 | FM | RX only | Marine ch 22 (coast/shore station) - Port operations / working |
| 223 | MAR23-C | 161.7500 | FM | RX only | Marine ch 23 (coast/shore station) - Port operations / working |
| 224 | MAR24-C | 161.8000 | FM | RX only | Marine ch 24 (coast/shore station) - Port operations / working |
| 225 | MAR25-C | 161.8500 | FM | RX only | Marine ch 25 (coast/shore station) - Port operations / working |
| 226 | MAR26-C | 161.9000 | FM | RX only | Marine ch 26 (coast/shore station) - Port operations / working |
| 227 | MAR27-C | 161.9500 | FM | RX only | Marine ch 27 (coast/shore station) - Port operations / working |
| 228 | MAR28-C | 162.0000 | FM | RX only | Marine ch 28 (coast/shore station) - Port operations / working |
| 260 | MAR60-C | 160.6250 | FM | RX only | Marine ch 60 (coast/shore station) - Port operations / working |
| 261 | MAR61-C | 160.6750 | FM | RX only | Marine ch 61 (coast/shore station) - Port operations / working |
| 262 | MAR62-C | 160.7250 | FM | RX only | Marine ch 62 (coast/shore station) - Port operations / working |
| 263 | MAR63-C | 160.7750 | FM | RX only | Marine ch 63 (coast/shore station) - Port operations / working |
| 264 | MAR64-C | 160.8250 | FM | RX only | Marine ch 64 (coast/shore station) - Port operations / working |
| 265 | MAR65-C | 160.8750 | FM | RX only | Marine ch 65 (coast/shore station) - SAR / working |
| 266 | MAR66-C | 160.9250 | FM | RX only | Marine ch 66 (coast/shore station) - Port operations / working |
| 278 | MAR78-C | 161.5250 | FM | RX only | Marine ch 78 (coast/shore station) - Port operations / working |
| 279 | MAR79-C | 161.5750 | FM | RX only | Marine ch 79 (coast/shore station) - Port operations / working |
| 280 | MAR80-C | 161.6250 | FM | RX only | Marine ch 80 (coast/shore station) - UK primary marina working channel |
| 281 | MAR81-C | 161.6750 | FM | RX only | Marine ch 81 (coast/shore station) - Port operations / working |
| 282 | MAR82-C | 161.7250 | FM | RX only | Marine ch 82 (coast/shore station) - Port operations / working |
| 283 | MAR83-C | 161.7750 | FM | RX only | Marine ch 83 (coast/shore station) - Port operations / working |
| 284 | MAR84-C | 161.8250 | FM | RX only | Marine ch 84 (coast/shore station) - Port operations / working |
| 285 | MAR85-C | 161.8750 | FM | RX only | Marine ch 85 (coast/shore station) - Port operations / working |
| 286 | MAR86-C | 161.9250 | FM | RX only | Marine ch 86 (coast/shore station) - Port operations / working |

## Airband - airfields & services

| Ch | Name | Freq (MHz) | Mode | TX | What it is |
|---|---|---|---|---|---|
| 301 | SAFETYCOM | 135.4750 | AM | RX only | UK uncontrolled-airfield broadcasts |
| 302 | LON INFO | 124.6000 | AM | RX only | London Information FIS |
| 310 | LYDD APP | 120.7000 | AM | RX only | Lydd Approach |
| 311 | LYDD TWR | 128.5250 | AM | RX only | Lydd Tower |
| 312 | LYDD ATIS | 129.2250 | AM | RX only | Lydd ATIS |
| 313 | HDCRN A/G | 122.0000 | AM | RX only | Headcorn A/G (verify on-site) |
| 314 | ROCH AFIS | 122.2550 | AM | RX only | Rochester AFIS |
| 315 | BGH TWR | 134.8050 | AM | RX only | Biggin Hill Tower |
| 316 | BGH APP | 129.4050 | AM | RX only | Biggin Hill Approach |
| 317 | BGH ATIS | 135.6800 | AM | RX only | Biggin Hill ATIS |
| 318 | SND TWR | 127.7250 | AM | RX only | Southend Tower |
| 319 | SND APP | 130.7750 | AM | RX only | Southend Radar/Approach |
| 320 | SND ATIS | 121.8000 | AM | RX only | Southend ATIS (verify) |
| 330 | GTW TWR | 124.2250 | AM | RX only | Gatwick Tower |
| 331 | GTW APP | 126.8250 | AM | RX only | Gatwick Approach |
| 332 | GTW DIR | 118.9500 | AM | RX only | Gatwick Director |
| 333 | GTW ATIS | 136.5250 | AM | RX only | Gatwick ATIS |
| 340 | LHR TWR | 118.5000 | AM | RX only | Heathrow Tower |
| 341 | LHR APP | 119.7250 | AM | RX only | Heathrow Director/Approach |
| 342 | LHR ATIS | 128.0750 | AM | RX only | Heathrow ATIS |
| 350 | LCY TWR | 118.0750 | AM | RX only | London City Tower |
| 351 | THAMES R | 132.7000 | AM | RX only | Thames Radar (LCY/low-level) |
| 352 | LCY ATIS | 136.3500 | AM | RX only | London City ATIS |

## Notes

- **Transmit policy:** only PMR446 (ch 1-16) and the two Alpine channels (17-18) transmit, at 500&nbsp;mW. All other channels are receive-only and TX-blocked in firmware.
- **Alpine channels** send a CTCSS tone on transmit (FR 85.4&nbsp;Hz, IT 114.8&nbsp;Hz) per the Alpine distress convention, but receive open.
- **Marine coast side** (201-286) lets you hear shore stations and marinas on the duplex pair; the ship side (101-188) carries inter-ship and calling traffic.
- **Airband** is AM. Distant airport ground stations may be out of range from a handheld; aircraft and nearer fields come through best.
