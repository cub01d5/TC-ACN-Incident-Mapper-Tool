# TC-ACN-Incident-Mapper-Tool

Lo strumento **TC-ACN-Incident-Mapper-Tool** è una dashboard interattiva pensata per supportare professionisti di cybersecurity e analisti nella mappatura degli incidenti informatici in accordo con la **Tassonomia ACN (Agenzia per la Cybersicurezza Nazionale della Repubblica Italiana)**.

L'applicazione permette di definire, visualizzare ed esportare in modo rapido rigorosi vettori descrittivi in conformità agli standard nazionali previsti per il reporting degli eventi cyber. L'interfaccia si basa su puramente su tecnologie web standard (HTML, CSS e JavaScript), garantendo grande flessibilità ed eseguibilità immediata.

## Caratteristiche Principali

- **Mapping Manuale Interattivo**: Una dashboard organizzata a griglia che riporta i predicati della tassonomia (Baseline Characterization, Threat Type, Threat Actor, ed elementi addizionali come Vector, Abusive Content, Physical Security, ecc.).
- **Dizionario Integrato (Tooltips)**: Durante la mappatura, passando o focalizzandosi sulle etichette dei vari campi compare un comodo tooltip in tempo reale, che mostra la definizione del predicato ACN e delucida ogni singola opzione disponibile, evitando confusione sugli input.
- **Generazione e Parsing di Vettori ACN**: Al termine della mappatura, con un semplice clic puoi autogenerare la stringa vettore standardizzata che rappresenta le tue scelte (es: `BC:IM_AP BC:RO_MA TT:AV_DD...`). 
- **Reverse Mapping (Popola Vettori)**: Un utile tool inverso in cui l'utente può incollare una stringa vettore ACN generata in precedenza, con il sistema che andrà automaticamente a "srotolare" e compilare i campi della dashboard per leggere visivamente la natura dell'incidente.
- **AI Vector Builder**: Un'integrazione di Intelligenza Artificiale multiprovider (configurabile con OpenAI, Google Gemini, o Anthropic Claude) che permette di incollare una descrizione dell'incidente in linguaggio naturale. L'AI estrarrà le informazioni e proporrà automaticamente una mappatura rigorosa secondo lo standard ACN, applicando poi i codici alla dashboard di frontend.
- **Esportazione ad Alta Fedeltà (Screenshot Report)**: Grazie alla funzione di "Esporta come Immagine Modello", è possibile scaricare un riassunto dei criteri di mappatura inseriti organizzati visivamente su schede di report classificate per presentazioni pronte all'uso.
- **Design Avanzato Modulare**: L'interfaccia utente è guidata da design e look premium ("lassmorphism"), con transizioni fluide, palette dark/light dinamiche e raggruppamento per aree di crisi in un ambiente che enfatizza un layout da cruscotto operativo.

## Struttura del Progetto

- `v1.html`: Il core dell'applicazione. Contiene tutto il markup, la logica JavaScript (event listeners, chiamate API LLM, generazione tooltips e compilazione vettori), e i dati di cache integrati della tassonomia ACN.
- `style.css`: Il database visuale. Offre design system moderno, layout responsivi, stili delle card in glassmorphism, varianti del tema "Dark Mode" e le classi utili all'interazione dell'utente.
- `taxonomy_full.json`: Il documento standard sorgente intero (JSON) dell'ACN Taxonomy originale per riferimento di backend o per future espansioni.
- `ACN_Tassonomia_Cyber_CLEAR.pdf`: Documentazione di classificazione redatta dall'ACN a puro scopo di riferimento accademico.

## Come Iniziare

Questo strumento è **100% Client-Side** e completamente serverless per quanto riguarda l'esecuzione standard.

1. Estrai o assicurati di essere nella cartella del progetto.
2. Fai semplicemente doppio clic per aprire il file `v1.html` tramite qualsiasi browser moderno supportato (es. Chrome, Edge, Firefox, Safari).
3. Non vi è necessità di server pre-installati né di dipendenze NodeJS.
4. *Nota per l'utilizzo dell'Intelligenza Artificiale*: In alto a destra è presente una rotella di ingranaggio. Fare clic sul pulsante delle Impostazioni AI per definire API Key e Provider desiderato nel caso si voglia adoperare il generatore natuarale "AI Vector Builder". L'interfaccia salverà questi dati sensibili esclusivamente nello storage interno del tuo browser (Local Storage) nel rispetto della privacy.

## Informazioni Tecniche e Compatibilità

L'applicazione comunica con la Clipboard API per copiare il vettore, con localStorage per il salvataggio preferenze o chiavi per le API-AI, e integra nativamente `html2canvas` tramite CDN. Mantiene performance ideali e alta responsività, ma è originariamente calibrata per visualizzazioni Desktop-first adatte ad operazioni di SOC o analisi informatiche.
