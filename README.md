# 🀄 Mahjong Solitario per ipovedenti

Una versione accessibile e semplificata del classico Mahjong Solitario, progettata specificamente per persone ipovedenti e per funzionare su hardware datato senza connessione internet.

## 🎯 Obiettivo del Progetto

Questo software nasce per permettere a una persona anziana con ridotta capacità visiva di giocare comodamente. Le priorità del design sono state:
1.  **Alta Visibilità:** Alto contrasto, simboli chiari (niente ideogrammi complessi), bordi spessi.
2.  **Accessibilità Motoria:** Sistema di zoom e panning stabile e fluido.
3.  **Compatibilità:** Scritto in ES5 (Javascript Vanilla) per girare su vecchie versioni di Chrome (Windows 7).
4.  **Sicurezza:** Funziona interamente offline (nessun rischio malware).
5.  **Risolvibilità:** Un algoritmo inverso garantisce che **ogni partita sia risolvibile al 100%**.

## ✨ Funzionalità Principali

*   **Grafica Accessibile:**
    *   Tessere grandi con simboli semplici (Numeri, Lettere, Forme, Numeri Romani).
    *   Le tessere bloccate sono grigie solide (non trasparenti) per evitare confusione visiva.
    *   Effetto 3D accentuato per distinguere i livelli di altezza.
    *   Selezione evidenziata in giallo fluo ad alto contrasto.
*   **Controlli Ottimizzati:**
    *   **Zoom:** Limitato per evitare che la tavola diventi troppo piccola o troppo grande.
    *   **Panning (Spostamento):** Movimento 1:1 preciso, bloccato se si tenta di uscire dallo schermo.
    *   **Centratura Automatica:** All'avvio la tavola si adatta perfettamente alla finestra.
*   **Salvataggio Automatico:** Chiudendo il browser, la partita viene salvata. Alla riapertura si riprende esattamente dallo stesso punto.
*   **Sistema a Seed:** Ogni partita ha un codice numerico. È possibile rigiocare la stessa partita inserendo il codice.

## 🚀 Installazione e Utilizzo

Non è richiesta alcuna installazione complessa o server web.

1.  Scarica i tre file del progetto:
    *   `index.html`
    *   `script.js`
    *   `style.css`
2.  Inseriscili tutti in un'unica cartella (es. sul Desktop chiamata `Mahjong`).
3.  Fai doppio click su **`index.html`** per avviare il gioco nel browser predefinito.

## 🎮 Controlli di Gioco

| Azione | Input Mouse | Descrizione |
| :--- | :--- | :--- |
| **Seleziona Tessera** | Tasto Sinistro | Clicca su una tessera libera. Clicca su una seconda uguale per eliminarle. |
| **Sposta Tavola** | Tasto Destro (Tieni premuto) | Tieni premuto il tasto destro e trascina il mouse per muovere la visuale. |
| **Zoom** | Rotellina Mouse | Ruota per ingrandire o rimpicciolire. |

## 🛠️ Dettagli Tecnici

*   **Stack:** HTML5, CSS3, Javascript (ES5).
*   **Dipendenze:** Nessuna (Zero dependencies).
*   **Compatibilità Browser:** Testato su Chrome (anche versioni legacy), Firefox, Edge.
*   **Algoritmo:** Generazione procedurale inversa. La tavola viene creata "smontandola" logicamente a coppie, garantendo matematicamente che esista sempre una soluzione.

## 📂 Struttura dei File

```text
/
├── index.html   # Struttura della pagina e contenitore del gioco
├── style.css    # Stili per alto contrasto e layout
└── script.js    # Logica di gioco, algoritmo di generazione e gestione input
